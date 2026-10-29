/* ==========================================
   EduSphere Results Management
   results.js
   Part 1
========================================== */

// ===============================
// Login Protection
// ===============================

import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const studentsCollection = collection(db, "students");
const resultsCollection = collection(db, "results");

let students = [];
let results = [];

if(localStorage.getItem("isLoggedIn") !== "true"){
    window.location.href="index.html";
}

// ===============================
// DOM Elements
// ===============================

const resultModal = document.getElementById("resultModal");

const addResultBtn = document.getElementById("addResult");

const closeModal = document.getElementById("closeModal");

const saveResultBtn = document.getElementById("saveResult");

const resultsTable = document.getElementById("resultsTable");

const studentName = document.getElementById("studentName");

const studentCourse = document.getElementById("studentCourse");

const mathMarks = document.getElementById("mathMarks");

const englishMarks = document.getElementById("englishMarks");

const computerMarks = document.getElementById("computerMarks");

const previewTotal = document.getElementById("previewTotal");

const previewPercentage = document.getElementById("previewPercentage");

const previewGrade = document.getElementById("previewGrade");

const totalResults = document.getElementById("totalResults");

const passedStudents = document.getElementById("passedStudents");

const averagePercentage = document.getElementById("averagePercentage");

const searchResult = document.getElementById("searchResult");

const courseFilter = document.getElementById("courseFilter");

const modalTitle = document.getElementById("modalTitle");

// ===============================
// Database
// ===============================


let editingId = null;

// ===============================
// Populate Student Dropdown
// ===============================

async function loadStudents() {

    const snapshot = await getDocs(studentsCollection);

    students = [];

    studentName.innerHTML = `
        <option value="">Select Student</option>
    `;

    snapshot.forEach((doc) => {

        const student = {
            id: doc.id,
            ...doc.data()
        };

        students.push(student);

        studentName.innerHTML += `
            <option value="${student.name}">
                ${student.name}
            </option>
        `;

    });

}

studentName.addEventListener("change", () => {

    const student = students.find(
        s => s.name === studentName.value
    );

    if(student){

        studentCourse.value = student.course;

    }

});
// ===============================
// Open Modal
// ===============================

addResultBtn.onclick = ()=>{

    editingId = null;

    modalTitle.textContent = "Add Result";

    clearForm();

    resultModal.style.display = "flex";

};

// ===============================
// Close Modal
// ===============================

closeModal.onclick = ()=>{

    resultModal.style.display = "none";

};

window.onclick = (e)=>{

    if(e.target === resultModal){

        resultModal.style.display = "none";

    }

};

// ===============================
// Clear Form
// ===============================

function clearForm(){

    studentName.value = "";

    studentCourse.value = "";

    mathMarks.value = "";

    englishMarks.value = "";

    computerMarks.value = "";

    previewTotal.textContent = "0";

    previewPercentage.textContent = "0%";

    previewGrade.textContent = "-";

}


/* ==========================================
   EduSphere Results Management
   results.js
   Part 2
========================================== */

// ===============================
// Calculate Result
// ===============================

function calculateResult(){

    const math = Number(mathMarks.value) || 0;

    const english = Number(englishMarks.value) || 0;

    const computer = Number(computerMarks.value) || 0;


    const total = math + english + computer;


    const percentage = 
        ((total / 300) * 100).toFixed(2);


    let grade;


    if(percentage >= 90){

        grade = "A+";

    }

    else if(percentage >= 80){

        grade = "A";

    }

    else if(percentage >= 70){

        grade = "B";

    }

    else if(percentage >= 60){

        grade = "C";

    }

    else if(percentage >= 50){

        grade = "D";

    }

    else{

        grade = "F";

    }


    previewTotal.textContent = total;

    previewPercentage.textContent =
        percentage + "%";

    previewGrade.textContent = grade;


    return {

        total,

        percentage,

        grade

    };

}


// Live Preview

mathMarks.addEventListener(
    "input",
    calculateResult
);

englishMarks.addEventListener(
    "input",
    calculateResult
);

computerMarks.addEventListener(
    "input",
    calculateResult
);


// ===============================
// Save Result
// ===============================

saveResultBtn.onclick = async () => {

    const student = studentName.value;
    const course = studentCourse.value;

    if (
        !student ||
        !course ||
        mathMarks.value === "" ||
        englishMarks.value === "" ||
        computerMarks.value === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    const resultData = calculateResult();

    const data = {
        student,
        course,
        math: Number(mathMarks.value),
        english: Number(englishMarks.value),
        computer: Number(computerMarks.value),
        total: resultData.total,
        percentage: resultData.percentage,
        grade: resultData.grade
    };

    try {

        if (editingId) {

            await updateDoc(
                doc(db, "results", editingId),
                data
            );

            alert("Result Updated");

        } else {

            await addDoc(
                resultsCollection,
                data
            );

            alert("Result Added");

        }

        resultModal.style.display = "none";

        clearForm();

        editingId = null;

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

};

// ===============================
// Render Results
// ===============================

function renderResults(){

    resultsTable.innerHTML="";


    results.forEach((result,index)=>{


        const status =
        result.percentage >= 40
        ? "Pass"
        : "Fail";


        resultsTable.innerHTML += `

<tr>

<td>${index+1}</td>

<td>${result.student}</td>

<td>${result.course}</td>

<td>${result.math}</td>

<td>${result.english}</td>

<td>${result.computer}</td>

<td>${result.total}/300</td>

<td>${result.percentage}%</td>

<td>

<span class="grade">

${result.grade}

</span>

</td>

<td class="${status==="Pass"?"pass":"fail"}">

${status}

</td>


<td>


<div class="action-buttons">


<button
class="edit-btn"
onclick="editResult('${result.id}')">

<i class="fa-solid fa-pen"></i>

</button>


<button
class="delete-btn"
onclick="deleteResult('${result.id}')">

<i class="fa-solid fa-trash"></i>

</button>


</div>


</td>


</tr>

`;

    });


    updateStats();


}


// ===============================
// Statistics
// ===============================

function updateStats(){


    totalResults.textContent =
        results.length;


    let passed =
    results.filter(
        r=>r.percentage>=40
    ).length;


    passedStudents.textContent =
        passed;


    if(results.length===0){

        averagePercentage.textContent="0%";

        return;

    }


    let avg =
    results.reduce(
        (sum,r)=>
        sum + Number(r.percentage),
        0
    )
    / results.length;


    averagePercentage.textContent =
    avg.toFixed(1)+"%";


}

/* ==========================================
   EduSphere Results Management
   results.js
   Part 3
========================================== */

// ===============================
// Edit Result
// ===============================

function editResult(id){

    const result = results.find(
        r => r.id === id
    );


    if(!result) return;


    editingId = id;


    modalTitle.textContent =
    "Edit Result";


    studentName.value =
    result.student;


    studentCourse.value =
    result.course;


    mathMarks.value =
    result.math;


    englishMarks.value =
    result.english;


    computerMarks.value =
    result.computer;


    calculateResult();


    resultModal.style.display="flex";


}


window.editResult = editResult;


// ===============================
// Delete Result
// ===============================

async function deleteResult(id){

    if(!confirm("Delete this result?")) return;

    try{

        await deleteDoc(doc(db,"results",id));

        alert("Result Deleted");

    }catch(error){

        console.error(error);

    }

}

window.deleteResult = deleteResult;

// ===============================
// Search Results
// ===============================

function filterResults(){


    const keyword =
    searchResult.value
    .toLowerCase()
    .trim();


    const course =
    courseFilter.value;


    const rows =
    resultsTable.querySelectorAll("tr");


    rows.forEach(row=>{


        const text =
        row.innerText
        .toLowerCase();


        const rowCourse =
        row.children[2]
        .innerText;


        const matchText =
        text.includes(keyword);


        const matchCourse =
        course==="" ||
        rowCourse===course;


        row.style.display =
        matchText && matchCourse
        ? ""
        : "none";


    });


}


searchResult.addEventListener(
    "input",
    filterResults
);


courseFilter.addEventListener(
    "change",
    filterResults
);


// ===============================
// Logout
// ===============================

function logout(){


    localStorage.removeItem(
        "isLoggedIn"
    );


    localStorage.removeItem(
        "adminName"
    );


    localStorage.removeItem(
        "adminEmail"
    );


    window.location.href =
    "index.html";


}


window.logout = logout;


// ===============================
// Print Marksheet
// ===============================

function printMarksheet(id){


    const result =
    results.find(
        r=>r.id===id
    );


    if(!result) return;


    let printWindow =
    window.open("");


    printWindow.document.write(`

<html>

<head>

<title>Marksheet</title>

<style>

body{

font-family:Poppins;
padding:40px;

}

h1{

text-align:center;

}

table{

width:100%;
border-collapse:collapse;

}

td,th{

border:1px solid #333;
padding:10px;

}

</style>

</head>


<body>


<h1>EduSphere College</h1>

<h2>Student Marksheet</h2>


<table>


<tr>

<th>Name</th>

<td>${result.student}</td>

</tr>


<tr>

<th>Course</th>

<td>${result.course}</td>

</tr>


<tr>

<th>Total</th>

<td>${result.total}/300</td>

</tr>


<tr>

<th>Percentage</th>

<td>${result.percentage}%</td>

</tr>


<tr>

<th>Grade</th>

<td>${result.grade}</td>

</tr>


</table>


</body>

</html>

`);


printWindow.print();


}


window.printMarksheet =
printMarksheet;


// ===============================
// Keyboard Shortcut
// ===============================


// ESC Close Modal

document.addEventListener(
"keydown",
(e)=>{


if(e.key==="Escape"){

resultModal.style.display="none";

}


});


// CTRL + N Add Result

document.addEventListener(
"keydown",
(e)=>{


if(
e.ctrlKey &&
e.key.toLowerCase()==="n"
){

e.preventDefault();

addResultBtn.click();

}


});


// ===============================
// Initialize
// ===============================

window.addEventListener("load", () => {

    loadStudents();

    onSnapshot(resultsCollection, (snapshot) => {

        results = [];

        snapshot.forEach((document) => {

            results.push({
                id: document.id,
                ...document.data()
            });

        });

        renderResults();

    });

});