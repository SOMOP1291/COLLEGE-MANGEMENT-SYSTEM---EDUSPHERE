/* ==========================================
   EduSphere Teacher Management
   teachers.js
   Part 1
========================================== */

// ===============================
// Dashboard Protection
// ===============================
import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const teachersCollection = collection(db, "teachers");

let teachers = [];

if(localStorage.getItem("isLoggedIn") !== "true"){

    window.location.href="index.html";

}

// ===============================
// DOM Elements
// ===============================

const modal=document.getElementById("teacherModal");

const addTeacherBtn=document.getElementById("addTeacher");

const closeModal=document.getElementById("closeModal");

const saveTeacherBtn = document.getElementById("saveTeacher");

const teacherTable=document.getElementById("teacherTable");

const totalTeachers=document.getElementById("totalTeachers");

const activeTeachers=document.getElementById("activeTeachers");

const searchTeacher=document.getElementById("searchTeacher");

const departmentFilter=document.getElementById("departmentFilter");

const teacherName=document.getElementById("teacherName");

const teacherEmail=document.getElementById("teacherEmail");

const teacherPhone=document.getElementById("teacherPhone");

const teacherDepartment=document.getElementById("teacherDepartment");

const teacherSubject=document.getElementById("teacherSubject");

const teacherExperience=document.getElementById("teacherExperience");

const teacherSalary=document.getElementById("teacherSalary");

const modalTitle=document.getElementById("modalTitle");

// ===============================
// Database
// ===============================


let editingId=null;

// ===============================
// Open Modal
// ===============================

addTeacherBtn.onclick=()=>{

    editingId=null;

    modalTitle.textContent="Add Teacher";

    clearForm();

    modal.style.display="flex";

};

// ===============================
// Close Modal
// ===============================

closeModal.onclick=()=>{

    modal.style.display="none";

};

window.onclick=(e)=>{

    if(e.target===modal){

        modal.style.display="none";

    }

};

// ===============================
// Clear Form
// ===============================

function clearForm(){

    teacherName.value="";

    teacherEmail.value="";

    teacherPhone.value="";

    teacherDepartment.value="";

    teacherSubject.value="";

    teacherExperience.value="";

    teacherSalary.value="";

}


// ===============================
// Avatar
// ===============================

function getAvatar(name){

    return name.charAt(0).toUpperCase();

}

/* ==========================================
   EduSphere Teacher Management
   teachers.js
   Part 2
========================================== */

// ===============================
// Save Teacher
// ===============================

saveTeacherBtn.onclick = async () => {

    const name = teacherName.value.trim();
    const email = teacherEmail.value.trim();
    const phone = teacherPhone.value.trim();
    const department = teacherDepartment.value;
    const subject = teacherSubject.value.trim();
    const experience = teacherExperience.value.trim();
    const salary = teacherSalary.value.trim();

    if(!name || !email || !phone || !department || !subject || !experience || !salary){

        alert("Please fill all fields.");
        return;
    }

    const teacherData = {
        name,
        email,
        phone,
        department,
        subject,
        experience,
        salary
    };

    try{

        if(editingId){

            await updateDoc(
                doc(db,"teachers",editingId),
                teacherData
            );

            showToast("Teacher Updated");

        }else{

            await addDoc(
                teachersCollection,
                teacherData
            );

            showToast("Teacher Added");

        }

        modal.style.display="none";

        clearForm();

        editingId=null;

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

function showToast(message){

    alert(message);

}

// ===============================
// Edit Teacher
// ===============================

function editTeacher(id){

    const teacher = teachers.find(t => t.id === id);

    if(!teacher) return;

    editingId = id;

    modalTitle.textContent = "Edit Teacher";

    teacherName.value = teacher.name;

    teacherEmail.value = teacher.email;

    teacherPhone.value = teacher.phone;

    teacherDepartment.value = teacher.department;

    teacherSubject.value = teacher.subject;

    teacherExperience.value = teacher.experience;

    teacherSalary.value = teacher.salary;

    modal.style.display = "flex";

}

// Global Function

window.editTeacher = editTeacher;

// ===============================
// Delete Teacher
// ===============================

async function deleteTeacher(id){

    if(!confirm("Delete this teacher?")) return;

    try{

        await deleteDoc(doc(db,"teachers",id));

        showToast("Teacher Deleted");

    }

    catch(error){

        console.error(error);

    }

}

window.deleteTeacher = deleteTeacher;

// Global Function



// ===============================
// Load
// ===============================

function loadTeachers(){

    onSnapshot(teachersCollection,(snapshot)=>{

        teachers = [];

        snapshot.forEach((document)=>{

            teachers.push({
                id: document.id,
                ...document.data()
            });

        });

        renderTeachers();   // ✅ Sahi
    });

}
// ===============================
// Render Table
// ===============================

function renderTeachers(){

    teacherTable.innerHTML = "";

    teachers.forEach((teacher,index)=>{

        teacherTable.innerHTML += `

<tr>

<td>${index+1}</td>

<td>

<div class="avatar">

${getAvatar(teacher.name)}

</div>

</td>

<td>${teacher.name}</td>

<td>${teacher.department}</td>

<td>${teacher.subject}</td>

<td>${teacher.experience} Years</td>

<td>₹ ${teacher.salary}</td>

<td>${teacher.phone}</td>

<td>${teacher.email}</td>

<td>

<div class="action-buttons">

<button
class="edit-btn"
onclick="editTeacher('${teacher.id}')">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="delete-btn"
onclick="deleteTeacher('${teacher.id}')">

<i class="fa-solid fa-trash"></i>

</button>

</div>

</td>

</tr>

`;

    });

    totalTeachers.textContent = teachers.length;

    activeTeachers.textContent = teachers.length;

}

/* ==========================================
   EduSphere Teacher Management
   teachers.js
   Part 3
========================================== */

// ===============================
// Search Teacher
// ===============================

searchTeacher.addEventListener("input", filterTeachers);

departmentFilter.addEventListener("change", filterTeachers);

function filterTeachers(){

    const keyword = searchTeacher.value.toLowerCase().trim();

    const department = departmentFilter.value;

    const rows = teacherTable.querySelectorAll("tr");

    rows.forEach(row=>{

        const text = row.innerText.toLowerCase();

        const dept = row.children[3].innerText;

        const matchKeyword = text.includes(keyword);

        const matchDepartment =
            department === "" || dept === department;

        row.style.display =
            matchKeyword && matchDepartment
                ? ""
                : "none";

    });

}

// ===============================
// Email Validation
// ===============================

function validEmail(email){

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

// ===============================
// Phone Validation
// ===============================

function validPhone(phone){

    return /^[6-9]\d{9}$/.test(phone);

}

// Improve Save Validation
// (Call before saving if desired)

// Example:
// if(!validEmail(email)){...}
// if(!validPhone(phone)){...}

// ===============================
// Logout
// ===============================

function logout(){

    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("adminName");

    localStorage.removeItem("adminEmail");

    window.location.href="index.html";

}

window.logout = logout;

// ===============================
// Keyboard Shortcut
// ===============================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        modal.style.display="none";

    }

});

// Ctrl + N => Add Teacher

document.addEventListener("keydown",(e)=>{

    if(e.ctrlKey && e.key.toLowerCase()==="n"){

        e.preventDefault();

        addTeacherBtn.click();

    }

});

// ===============================
// Dashboard Protection
// ===============================

if(localStorage.getItem("isLoggedIn")!=="true"){

    window.location.href="index.html";

}

// ===============================
// Welcome Message
// ===============================

const adminName =
    localStorage.getItem("adminName") || "Admin";

console.log(`Welcome ${adminName}`);

// ===============================
// Initialize
// ===============================

function init(){

    loadTeachers();

}

window.addEventListener("load", init);