import { initCrud } from './crud.js';
import { esc, inr, badge } from './layout.js';
const COURSES = ['BCA', 'BBA', 'BSc', 'BA'], DEPTS = ['Computer Science', 'Commerce', 'Mathematics', 'Science', 'Arts'];
const sum = (a, k) => a.reduce((s, x) => s + (+x[k] || 0), 0);
const grade = p => p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 40 ? 'D' : 'F';
const stat = s => badge(s, ['Paid', 'Pass'].includes(s) ? 'ok' : 'bad');
const T = (key, label, extra = {}) => ({ key, label, ...extra });

const M = {
  students: { collection: 'students', title: 'Students', singular: 'Student', sub: 'Admissions and student records',
    search: ['name', 'email', 'course'], filter: { key: 'course', label: 'courses', options: COURSES },
    fields: [T('name', 'Full name', { req: 1 }), T('email', 'Email', { type: 'email', req: 1 }), T('phone', 'Phone', { type: 'tel' }),
      T('course', 'Course', { type: 'select', options: COURSES, req: 1 }), T('year', 'Year', { type: 'select', options: ['1', '2', '3', '4'], req: 1 })],
    columns: [T('name', 'Name'), T('course', 'Course'), T('year', 'Year'), T('email', 'Email'), T('phone', 'Phone')],
    stats: d => [['Total students', d.length, 'fa-user-graduate'], ['Courses in use', new Set(d.map(x => x.course)).size, 'fa-book']] },

  teachers: { collection: 'teachers', title: 'Teachers', singular: 'Teacher', sub: 'Faculty and staff',
    search: ['name', 'subject', 'email'], filter: { key: 'department', label: 'departments', options: DEPTS },
    fields: [T('name', 'Full name', { req: 1 }), T('email', 'Email', { type: 'email', req: 1 }), T('phone', 'Phone', { type: 'tel' }),
      T('department', 'Department', { type: 'select', options: DEPTS, req: 1 }), T('subject', 'Subject', { req: 1 }),
      T('experience', 'Experience (years)', { type: 'number', min: 0 }), T('salary', 'Monthly salary (₹)', { type: 'number', min: 0 })],
    columns: [T('name', 'Name'), T('department', 'Department'), T('subject', 'Subject'), T('experience', 'Exp. (yrs)'), T('salary', 'Salary', { render: r => inr(r.salary) }), T('phone', 'Phone')],
    stats: d => [['Total teachers', d.length, 'fa-chalkboard-user'], ['Departments', new Set(d.map(x => x.department)).size, 'fa-building-columns'], ['Monthly payroll', inr(sum(d, 'salary')), 'fa-money-bill-wave']] },

  courses: { collection: 'courses', title: 'Courses', singular: 'Course', sub: 'Programmes offered by the college',
    search: ['code', 'name', 'department', 'teacher'], filter: { key: 'department', label: 'departments', options: DEPTS },
    fields: [T('code', 'Course code', { req: 1 }), T('name', 'Course name', { req: 1 }), T('department', 'Department', { type: 'select', options: DEPTS, req: 1 }),
      T('duration', 'Duration', { type: 'select', options: ['1 Year', '2 Years', '3 Years', '4 Years'], req: 1 }),
      T('semester', 'Semesters', { type: 'number', min: 1, max: 8 }), T('fee', 'Fee (₹)', { type: 'number', min: 0 }), T('teacher', 'Assigned teacher')],
    columns: [T('code', 'Code'), T('name', 'Course'), T('department', 'Department'), T('duration', 'Duration'), T('semester', 'Sem.'), T('fee', 'Fee', { render: r => inr(r.fee) }), T('teacher', 'Teacher')],
    stats: d => [['Total courses', d.length, 'fa-book'], ['Departments', new Set(d.map(x => x.department)).size, 'fa-building-columns'], ['Average fee', inr(d.length ? sum(d, 'fee') / d.length : 0), 'fa-money-bill-wave']] },

  fees: { collection: 'fees', title: 'Fees', singular: 'Fee', sub: 'Payments and pending dues',
    search: ['student', 'course'], filter: { key: 'status', label: 'status', options: ['Paid', 'Pending'] },
    fields: [T('student', 'Student', { ref: 'students', fill: { course: 'course' } }), T('course', 'Course', { type: 'select', options: COURSES, req: 1 }),
      T('total', 'Total fee (₹)', { type: 'number', min: 0, req: 1 }), T('paid', 'Paid amount (₹)', { type: 'number', min: 0, req: 1 }), T('date', 'Payment date', { type: 'date', req: 1 })],
    compute: d => { const pending = Math.max(d.total - d.paid, 0); return { pending, status: pending ? 'Pending' : 'Paid' }; },
    columns: [T('student', 'Student'), T('course', 'Course'), T('total', 'Total', { render: r => inr(r.total) }), T('paid', 'Paid', { render: r => inr(r.paid) }),
      T('pending', 'Pending', { render: r => inr(r.pending) }), T('status', 'Status', { render: r => stat(r.status) }), T('date', 'Date')],
    stats: d => [['Collected', inr(sum(d, 'paid')), 'fa-wallet'], ['Pending dues', inr(sum(d, 'pending')), 'fa-hourglass-half'], ['Fully paid', d.filter(x => x.status === 'Paid').length, 'fa-circle-check']] },

  results: { collection: 'results', title: 'Results', singular: 'Result', sub: 'Marks, grades and pass status',
    search: ['student', 'course'], filter: { key: 'course', label: 'courses', options: COURSES },
    fields: [T('student', 'Student', { ref: 'students', fill: { course: 'course' } }), T('course', 'Course', { type: 'select', options: COURSES, req: 1 }),
      ...['math', 'english', 'computer'].map(k => T(k, k[0].toUpperCase() + k.slice(1) + ' marks', { type: 'number', min: 0, max: 100, req: 1 }))],
    compute: d => { const total = d.math + d.english + d.computer, percentage = +(total / 3).toFixed(1);
      return { total, percentage, grade: grade(percentage), status: percentage >= 40 && Math.min(d.math, d.english, d.computer) >= 33 ? 'Pass' : 'Fail' }; },
    columns: [T('student', 'Student'), T('course', 'Course'), T('math', 'Math'), T('english', 'English'), T('computer', 'Computer'), T('total', 'Total /300'),
      T('percentage', '%', { render: r => esc(r.percentage) + '%' }), T('grade', 'Grade'), T('status', 'Status', { render: r => stat(r.status) })],
    stats: d => [['Total results', d.length, 'fa-chart-column'], ['Passed', d.filter(x => x.status === 'Pass').length, 'fa-circle-check'],
      ['Average %', (d.length ? sum(d, 'percentage') / d.length : 0).toFixed(1) + '%', 'fa-percent']] },
};
const page = document.body.dataset.page;
initCrud({ page, ...M[page] });
