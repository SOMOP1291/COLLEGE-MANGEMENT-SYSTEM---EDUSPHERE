// =====================================
// College Management System
// students.js
// Part 1
// =====================================

// students.js

import { db } from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ===============================
// Login Protection
// ===============================

if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "index.html";
}

// DOM Elements
const studentsCollection = collection(db, "students");
const modal = document.getElementById("modal");
const addBtn = document.getElementById("addStudent");
const saveBtn = document.getElementById("saveStudent");
const closeModal = document.getElementById("closeModal");

const table = document.getElementById("studentTable");
const totalStudents = document.getElementById("totalStudents");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const courseInput = document.getElementById("course");
const yearInput = document.getElementById("year");

const searchInput = document.getElementById("search");
const courseFilter = document.getElementById("courseFilter");
const modalTitle = document.getElementById("modalTitle");

// Database
let students = [];
let editingId = null;

// =====================================
// Open Modal
// =====================================

addBtn.addEventListener("click", () => {

    editingId = null;

    modalTitle.innerText = "Add Student";

    clearForm();

    modal.style.display = "flex";

});

// =====================================
// Close Modal
// =====================================

closeModal.addEventListener("click", () => {

    modal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});

// =====================================
// Save Student
// =====================================

saveBtn.addEventListener("click", async () => {

    const name = nameInput.value.trim();

    const email = emailInput.value.trim();

    const course = courseInput.value;

    const year = yearInput.value.trim();

    if (!name || !email || !year) {

        alert("Please fill all fields.");

        return;

    }

    if (!validateEmail(email)) {

        alert("Invalid Email Address");

        return;

    }

    if (editingId !== null) {

        const studentRef = doc(db, "students", editingId);

await updateDoc(studentRef, {
    name,
    email,
    course,
    year
});

showToast("Student Updated");

modal.style.display = "none";

clearForm();

editingId = null;

return;

    } else {

        const student = {
    name,
    email,
    course,
    year
};

saveStudent(student);

modal.style.display = "none";
clearForm();

return;

    }

  

    modal.style.display = "none";

    clearForm();

    renderStudents();

});

// =====================================
// Edit Student
// =====================================

function editStudent(id) {

    const student = students.find(s => s.id === id);

    editingId = id;

    modalTitle.innerText = "Edit Student";

    nameInput.value = student.name;

    emailInput.value = student.email;

    courseInput.value = student.course;

    yearInput.value = student.year;

    modal.style.display = "flex";

}

// =====================================
// Delete Student
// =====================================

async function removeStudent(id) {

    if (!confirm("Delete this student?")) return;

    try {

        await deleteDoc(doc(db, "students", id));

        showToast("Student Deleted");

    } catch (error) {

        console.error(error);

        alert("Delete Failed");

    }

}
// =====================================
// Save Database
// =====================================

async function saveStudent(student){

    try{

        await addDoc(studentsCollection, student);

        alert("Student Added Successfully ✅");

        loadStudents();

    }

    catch(error){

        console.error(error);

        alert("Error Saving Student");

    }

}

function loadStudents() {

    onSnapshot(studentsCollection, (snapshot) => {

        students = [];

        snapshot.forEach((document) => {

            students.push({
                id: document.id,
                ...document.data()
            });

        });

        renderStudents();

    });

}
// =====================================
// Clear Form
// =====================================

function clearForm() {

    nameInput.value = "";

    emailInput.value = "";

    courseInput.selectedIndex = 0;

    yearInput.value = "";

}

// =====================================
// Render Students
// =====================================

function renderStudents() {

    table.innerHTML = "";

    let filteredStudents = [...students];

    // Search
    const keyword = searchInput.value.trim().toLowerCase();

    if (keyword !== "") {

        filteredStudents = filteredStudents.filter(student =>
            student.name.toLowerCase().includes(keyword) ||
            student.email.toLowerCase().includes(keyword) ||
            student.course.toLowerCase().includes(keyword)
        );

    }

    // Course Filter
    if (courseFilter.value !== "") {

        filteredStudents = filteredStudents.filter(student =>
            student.course === courseFilter.value
        );

    }

    // Sort by Name
    filteredStudents.sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    if (filteredStudents.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;padding:30px;">
                No Students Found
            </td>
        </tr>
        `;

    } else {

        filteredStudents.forEach(student => {

            table.innerHTML += `
            <tr>

                <td>${student.id}</td>

                <td>${student.name}</td>

                <td>${student.course}</td>

                <td>${student.year}</td>

                <td>${student.email}</td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editStudent('${student.id}')">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="removeStudent('${student.id}')">

                        Delete

                    </button>

                </td>

            </tr>
            `;

        });

    }

    updateStatistics();

}

// =====================================
// Statistics
// =====================================

function updateStatistics() {

    totalStudents.innerText = students.length;

}

// =====================================
// Live Search
// =====================================

searchInput.addEventListener("keyup", () => {

    renderStudents();

});

// =====================================
// Course Filter
// =====================================

courseFilter.addEventListener("change", () => {

    renderStudents();

});

// =====================================
// Email Validation
// =====================================

function validateEmail(email) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);

}

// =====================================
// Reset Search
// =====================================

function resetSearch() {

    searchInput.value = "";

    courseFilter.selectedIndex = 0;

    renderStudents();

}

// =====================================
// Count By Course
// =====================================

function getCourseCount(course) {

    return students.filter(student =>
        student.course === course
    ).length;

}

// =====================================
// Console Info
// =====================================

console.log("College CMS Loaded Successfully");
console.log("Students:", students.length);

// =====================================
// Toast Notification
// =====================================

function showToast(message) {

    let toast = document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        toast.style.position = "fixed";
        toast.style.right = "20px";
        toast.style.bottom = "20px";
        toast.style.background = "#2563eb";
        toast.style.color = "#fff";
        toast.style.padding = "15px 20px";
        toast.style.borderRadius = "10px";
        toast.style.fontSize = "15px";
        toast.style.boxShadow = "0 8px 25px rgba(0,0,0,.2)";
        toast.style.zIndex = "9999";
        toast.style.transition = "all .3s ease";

        document.body.appendChild(toast);

    }

    toast.innerText = message;

    toast.style.opacity = "1";

    setTimeout(() => {

        toast.style.opacity = "0";

    }, 2500);

}

// =====================================
// Keyboard Shortcut
// Ctrl + N = Add Student
// =====================================

document.addEventListener("keydown", function (e) {

    if (e.ctrlKey && e.key.toLowerCase() === "n") {

        e.preventDefault();

        addBtn.click();

    }

});

// =====================================
// ESC Close Modal
// =====================================

document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {

        modal.style.display = "none";

    }

});

// =====================================
// Dashboard Helpers
// =====================================

function getTotalStudents() {

    return students.length;

}

function getCourses() {

    return [...new Set(students.map(s => s.course))];

}

function getYears() {

    return [...new Set(students.map(s => s.year))];

}

// =====================================
// Export Students
// =====================================

function exportStudents() {

    let csv = "ID,Name,Course,Year,Email\n";

    students.forEach(student => {

        csv += `${student.id},${student.name},${student.course},${student.year},${student.email}\n`;

    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "students.csv";

    a.click();

}

// =====================================
// Clear Database
// =====================================

async function clearDatabase() {

    if (!confirm("Delete ALL Students?")) return;

    try {

        const snapshot = await getDocs(studentsCollection);

        for (const documentItem of snapshot.docs) {

            await deleteDoc(documentItem.ref);

        }

        showToast("Database Cleared");

    } catch (error) {

        console.error(error);

        alert("Unable to Clear Database");

    }

}

// =====================================
// Initial Load
// =====================================

loadStudents();

console.log("================================");
console.log(" College Management System ");
console.log(" Student Module Loaded ");
console.log(" Total Students :", getTotalStudents());
console.log(" Courses :", getCourses());
console.log("================================");

window.editStudent = editStudent;
window.removeStudent = removeStudent;