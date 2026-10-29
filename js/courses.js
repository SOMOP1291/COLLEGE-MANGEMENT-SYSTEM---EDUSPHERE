/* ==========================================
   EduSphere Courses Management
   courses.js
   Part 1
========================================== */

import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ===============================
// Login Protection
// ===============================

if(localStorage.getItem("isLoggedIn") !== "true"){

    window.location.href = "index.html";

}

// ===============================
// Firestore
// ===============================

const coursesCollection = collection(db,"courses");

let courses = [];

let editingId = null;

// ===============================
// DOM Elements
// ===============================

const courseModal =
document.getElementById("courseModal");

const addCourse =
document.getElementById("addCourse");

const closeModal =
document.getElementById("closeModal");

const cancelCourse =
document.getElementById("cancelCourse");

const saveCourse =
document.getElementById("saveCourse");

const modalTitle =
document.getElementById("modalTitle");

const coursesTable =
document.getElementById("coursesTable");

const searchCourse =
document.getElementById("searchCourse");

const departmentFilter =
document.getElementById("departmentFilter");

// Form

const courseCode =
document.getElementById("courseCode");

const courseName =
document.getElementById("courseName");

const department =
document.getElementById("department");

const duration =
document.getElementById("duration");

const semester =
document.getElementById("semester");

const courseFee =
document.getElementById("courseFee");

const courseTeacher =
document.getElementById("courseTeacher");

const courseDescription =
document.getElementById("courseDescription");

// Statistics

const totalCourses =
document.getElementById("totalCourses");

const totalDepartments =
document.getElementById("totalDepartments");

const averageFees =
document.getElementById("averageFees");

const totalSemesters =
document.getElementById("totalSemesters");

/* ==========================================
   EduSphere Courses Management
   courses.js
   Part 2
========================================== */

// ===============================
// Open Modal
// ===============================

addCourse.onclick = () => {

    editingId = null;

    modalTitle.textContent = "Add Course";

    clearForm();

    courseModal.style.display = "flex";

};

// ===============================
// Close Modal
// ===============================

closeModal.onclick = () => {

    courseModal.style.display = "none";

};

cancelCourse.onclick = () => {

    courseModal.style.display = "none";

};

window.onclick = (e) => {

    if(e.target === courseModal){

        courseModal.style.display = "none";

    }

};

// ===============================
// Clear Form
// ===============================

function clearForm(){

    courseCode.value = "";

    courseName.value = "";

    department.value = "";

    duration.value = "";

    semester.value = "";

    courseFee.value = "";

    courseTeacher.value = "";

    courseDescription.value = "";

}

// ===============================
// Save Course
// ===============================

saveCourse.onclick = async () => {

    if(

        !courseCode.value ||

        !courseName.value ||

        !department.value ||

        !duration.value ||

        !semester.value ||

        !courseFee.value ||

        !courseTeacher.value

    ){

        alert("Please fill all required fields.");

        return;

    }

    const data = {

        code: courseCode.value,

        name: courseName.value,

        department: department.value,

        duration: duration.value,

        semester: semester.value,

        fees: Number(courseFee.value),

        teacher: courseTeacher.value,

        description: courseDescription.value

    };

    try{

        if(editingId){

            await updateDoc(

                doc(db,"courses",editingId),

                data

            );

            alert("Course Updated");

        }

        else{

            await addDoc(

                coursesCollection,

                data

            );

            alert("Course Added");

        }

        courseModal.style.display = "none";

        clearForm();

        editingId = null;

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

/* ==========================================
   EduSphere Courses Management
   courses.js
   Part 3
========================================== */

// ===============================
// Render Courses
// ===============================

function renderCourses(){

    coursesTable.innerHTML = "";

    courses.forEach((course,index)=>{

        coursesTable.innerHTML += `

<tr>

<td>${index+1}</td>

<td>${course.code}</td>

<td>${course.name}</td>

<td>${course.department}</td>

<td>${course.duration}</td>

<td>${course.semester}</td>

<td>₹${course.fees}</td>

<td>${course.teacher}</td>

<td>

<div class="action-buttons">

<button
class="edit-btn"
onclick="editCourse('${course.id}')">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="delete-btn"
onclick="deleteCourse('${course.id}')">

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

    totalCourses.textContent = courses.length;

    const departments = [
        ...new Set(courses.map(c => c.department))
    ];

    totalDepartments.textContent = departments.length;

    if(courses.length){

        const avg = courses.reduce(
            (sum,c)=>sum+Number(c.fees),
            0
        ) / courses.length;

        averageFees.textContent =
        "₹"+avg.toFixed(0);

    }else{

        averageFees.textContent="₹0";

    }

    let semesters = 0;

    courses.forEach(c=>{

        semesters += Number(c.semester);

    });

    totalSemesters.textContent = semesters;

}

// ===============================
// Edit Course
// ===============================

function editCourse(id){

    const course =
    courses.find(c=>c.id===id);

    if(!course) return;

    editingId = id;

    modalTitle.textContent =
    "Edit Course";

    courseCode.value = course.code;
    courseName.value = course.name;
    department.value = course.department;
    duration.value = course.duration;
    semester.value = course.semester;
    courseFee.value = course.fees;
    courseTeacher.value = course.teacher;
    courseDescription.value =
    course.description;

    courseModal.style.display="flex";

}

window.editCourse = editCourse;

// ===============================
// Delete Course
// ===============================

async function deleteCourse(id){

    if(!confirm(
        "Delete this course?"
    )) return;

    try{

        await deleteDoc(
            doc(db,"courses",id)
        );

        alert("Course Deleted");

    }

    catch(error){

        console.error(error);

    }

}

window.deleteCourse = deleteCourse;

// ===============================
// Firebase Live
// ===============================

onSnapshot(coursesCollection,(snapshot)=>{

    courses=[];

    snapshot.forEach((document)=>{

        courses.push({

            id:document.id,

            ...document.data()

        });

    });

    renderCourses();

});

/* ==========================================
   EduSphere Courses Management
   courses.js
   Part 4
========================================== */

// ===============================
// Search + Department Filter
// ===============================

function filterCourses(){

    const keyword =
    searchCourse.value
    .toLowerCase()
    .trim();

    const departmentValue =
    departmentFilter.value;

    const rows =
    coursesTable.querySelectorAll("tr");

    rows.forEach(row=>{

        const text =
        row.innerText
        .toLowerCase();

        const rowDepartment =
        row.children[3]
        .innerText
        .trim();

        const matchSearch =
        text.includes(keyword);

        const matchDepartment =

        departmentValue === "" ||

        rowDepartment === departmentValue;

        row.style.display =

        matchSearch && matchDepartment

        ? ""

        : "none";

    });

}

searchCourse.addEventListener(

    "input",

    filterCourses

);

departmentFilter.addEventListener(

    "change",

    filterCourses

);

// ===============================
// Logout
// ===============================

function logout(){

    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("adminName");

    localStorage.removeItem("adminEmail");

    window.location.href = "index.html";

}

window.logout = logout;

// ===============================
// Keyboard Shortcuts
// ===============================

// ESC Close Modal

document.addEventListener(

"keydown",

(e)=>{

    if(e.key==="Escape"){

        courseModal.style.display="none";

    }

});

// CTRL + N Add Course

document.addEventListener(

"keydown",

(e)=>{

    if(

        e.ctrlKey &&

        e.key.toLowerCase()==="n"

    ){

        e.preventDefault();

        addCourse.click();

    }

});

// ===============================
// Initialize
// ===============================

window.addEventListener("load",()=>{

    console.log(

        "%cCourses Module Loaded ✅",

        "color:#22c55e;font-size:18px;font-weight:bold;"

    );

});