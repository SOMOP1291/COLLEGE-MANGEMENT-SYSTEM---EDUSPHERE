/* ==========================================
   EduSphere Fees Management
   fees.js
   Part 1
========================================== */

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
const feesCollection = collection(db, "fees");

let students = [];
let fees = [];
let editingId = null;


// ===============================
// Login Protection
// ===============================

if(localStorage.getItem("isLoggedIn") !== "true"){

    window.location.href="index.html";

}


// ===============================
// DOM Elements
// ===============================


const feeModal =
document.getElementById("feeModal");


const addFee =
document.getElementById("addFee");


const closeFeeModal =
document.getElementById("closeFeeModal");


const saveFee =
document.getElementById("saveFee");


const feesTable =
document.getElementById("feesTable");


const feeStudent =
document.getElementById("feeStudent");


const feeCourse =
document.getElementById("feeCourse");


const totalFee =
document.getElementById("totalFee");


const paidFee =
document.getElementById("paidFee");


const feeStatus =
document.getElementById("feeStatus");


const paymentDate =
document.getElementById("paymentDate");



const previewTotalFee =
document.getElementById("previewTotalFee");


const previewPaidFee =
document.getElementById("previewPaidFee");


const previewPendingFee =
document.getElementById("previewPendingFee");



const totalCollection =
document.getElementById("totalCollection");


const paidStudents =
document.getElementById("paidStudents");


const pendingFees =
document.getElementById("pendingFees");



const searchFee =
document.getElementById("searchFee");


const statusFilter =
document.getElementById("statusFilter");


// ===============================
// Load Students Dropdown
// ===============================


async function loadStudents(){

    const snapshot = await getDocs(studentsCollection);

    students = [];

    feeStudent.innerHTML = `
        <option value="">Select Student</option>
    `;

    snapshot.forEach((document)=>{

        const student = {
            id: document.id,
            ...document.data()
        };

        students.push(student);

        feeStudent.innerHTML += `
            <option value="${student.name}">
                ${student.name}
            </option>
        `;

    });

}




// ===============================
// Open Modal
// ===============================


addFee.onclick=()=>{


    editingId=null;


    clearForm();


    feeModal.style.display="flex";


};



// ===============================
// Close Modal
// ===============================


closeFeeModal.onclick=()=>{


    feeModal.style.display="none";


};



window.onclick=(e)=>{


    if(e.target===feeModal){


        feeModal.style.display="none";


    }


};



// ===============================
// Clear Form
// ===============================


function clearForm(){


    feeStudent.value="";


    feeCourse.value="";


    totalFee.value="";


    paidFee.value="";


    feeStatus.value="Paid";


    paymentDate.value="";


    previewTotalFee.textContent="0";


    previewPaidFee.textContent="0";


    previewPendingFee.textContent="0";


}

/* ==========================================
   EduSphere Fees Management
   fees.js
   Part 2
========================================== */


// ===============================
// Calculate Pending
// ===============================


function calculateFee(){


    const total =
    Number(totalFee.value) || 0;


    const paid =
    Number(paidFee.value) || 0;


    const pending =
    total - paid;



    previewTotalFee.textContent =
    total;



    previewPaidFee.textContent =
    paid;



    previewPendingFee.textContent =
    pending;



    return{

        total,

        paid,

        pending

    };


}



totalFee.addEventListener(
"input",
calculateFee
);



paidFee.addEventListener(
"input",
calculateFee
);



// ===============================
// Save Fee
// ===============================


saveFee.onclick = async ()=>{

    const student = feeStudent.value;
    const course = feeCourse.value;

    if(!student || !course || totalFee.value===""){

        alert("Please fill all details");
        return;

    }

    const data = calculateFee();

    const feeData = {

        student,
        course,
        total: data.total,
        paid: data.paid,
        pending: data.pending,
        status: data.pending<=0 ? "Paid" : "Pending",
        date: paymentDate.value || new Date().toISOString().split("T")[0]

    };

    try{

        if(editingId){

            await updateDoc(
                doc(db,"fees",editingId),
                feeData
            );

            alert("Fee Updated");

        }else{

            await addDoc(
                feesCollection,
                feeData
            );

            alert("Fee Added");

        }

        feeModal.style.display="none";

        clearForm();

        editingId=null;

    }catch(error){

        console.error(error);

    }

};


// ===============================
// Render Fees
// ===============================


function renderFees(){


    feesTable.innerHTML="";



    fees.forEach((fee,index)=>{



        feesTable.innerHTML +=`


<tr>


<td>

${index+1}

</td>



<td>

${fee.student}

</td>




<td>

${fee.course}

</td>




<td>

₹${fee.total}

</td>




<td>

₹${fee.paid}

</td>




<td>

₹${fee.pending}

</td>




<td>


<span class="status ${fee.status.toLowerCase()}">

${fee.status}

</span>


</td>



<td>



<div class="action-buttons">



<button

class="edit-btn"

onclick="editFee('${fee.id}')"

>


<i class="fa-solid fa-pen">

</i>


</button>




<button

class="delete-btn"

onclick="deleteFee('${fee.id}')"

>


<i class="fa-solid fa-trash">

</i>


</button>



</div>


</td>


</tr>


`;



    });



}



// ===============================
// Dashboard Statistics
// ===============================


function updateStats(){



    let collection = 0;


    let paid = 0;


    let pending = 0;




    fees.forEach(fee=>{


        collection += Number(fee.paid);



        if(fee.status==="Paid"){


            paid++;


        }



        pending += Number(fee.pending);



    });





    totalCollection.textContent =

    "₹" + collection;



    paidStudents.textContent =

    paid;



    pendingFees.textContent =

    "₹" + pending;



}



// ===============================
// Edit Fee
// ===============================


function editFee(id){



    const fee =

    fees.find(
    f=>f.id===id
    );



    if(!fee)return;



    editingId=id;



    feeStudent.value =
    fee.student;


    feeCourse.value =
    fee.course;


    totalFee.value =
    fee.total;


    paidFee.value =
    fee.paid;


    paymentDate.value =
    fee.date;



    calculateFee();



    feeModal.style.display="flex";

}



window.editFee=editFee;



// ===============================
// Delete Fee
// ===============================


async function deleteFee(id){

    if(!confirm("Delete this fee record?")) return;

    try{

        await deleteDoc(
            doc(db,"fees",id)
        );

        alert("Fee Deleted");

    }catch(error){

        console.error(error);

    }

}

window.deleteFee = deleteFee;

/* ==========================================
   EduSphere Fees Management
   fees.js
   Part 3
========================================== */


// ===============================
// Search + Status Filter
// ===============================


function filterFees(){


    const keyword =

    searchFee.value
    .toLowerCase()
    .trim();



    const status =

    statusFilter.value;



    const rows =

    feesTable
    .querySelectorAll("tr");



    rows.forEach(row=>{


        const text =

        row.innerText
        .toLowerCase();



        const rowStatus =

        row.children[6]
        .innerText
        .trim();



        const matchText =

        text.includes(keyword);



        const matchStatus =

        status === "" ||

        rowStatus === status;



        row.style.display =

        matchText && matchStatus

        ? ""

        : "none";


    });


}



searchFee.addEventListener(

"input",

filterFees

);



statusFilter.addEventListener(

"change",

filterFees

);




// ===============================
// Print Receipt
// ===============================


function printReceipt(id){


    const fee =

    fees.find(

    f=>f.id===id

    );



    if(!fee)return;




    let receipt =

    window.open("");




    receipt.document.write(`


<html>


<head>


<title>

Fee Receipt

</title>



<style>


body{

font-family:Arial;

padding:40px;

}



h1{

text-align:center;

}



.receipt{

border:2px solid #333;

padding:25px;

border-radius:10px;

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



<div class="receipt">



<h1>

EduSphere College

</h1>



<h2>

Fee Payment Receipt

</h2>



<table>


<tr>

<th>Student</th>

<td>${fee.student}</td>

</tr>


<tr>

<th>Course</th>

<td>${fee.course}</td>

</tr>


<tr>

<th>Total Fee</th>

<td>₹${fee.total}</td>

</tr>


<tr>

<th>Paid Amount</th>

<td>₹${fee.paid}</td>

</tr>


<tr>

<th>Pending</th>

<td>₹${fee.pending}</td>

</tr>


<tr>

<th>Status</th>

<td>${fee.status}</td>

</tr>


<tr>

<th>Date</th>

<td>${fee.date}</td>

</tr>



</table>



</div>



</body>


</html>


`);



receipt.print();


}



window.printReceipt = printReceipt;





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
// Keyboard Shortcut
// ===============================


// CTRL + N Add Fee


document.addEventListener(

"keydown",

(e)=>{


    if(
    e.ctrlKey &&
    e.key.toLowerCase()==="n"
    ){

        e.preventDefault();


        addFee.click();


    }



});



// ESC Close Modal


document.addEventListener(

"keydown",

(e)=>{


    if(e.key==="Escape"){


        feeModal.style.display="none";


    }


});




// ===============================
// Initialize
// ===============================

window.addEventListener("load",()=>{

    loadStudents();

    onSnapshot(feesCollection,(snapshot)=>{

        fees=[];

        snapshot.forEach((document)=>{

            fees.push({

                id: document.id,
                ...document.data()

            });

        });

        renderFees();

        updateStats();

    });

});