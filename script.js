// Load data from server
async function loadDataFromServer() {
    try {
        const response = await fetch('/api/data');
        data = await response.json();
        currentClassIndex = data.currentClassIndex;
        currentClass = data.classes[currentClassIndex];
        teacherName = currentClass.teacher;
        students = currentClass.students;
        attendanceData = currentClass.attendanceData;
        document.getElementById('teacher-name').value = teacherName;
        renderClassSelect();
        renderAttendance();
        renderReports();
        renderViewData();
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to default
        data = {
            classes: [{ name: 'Default Class', teacher: '', students: ['Alice', 'Bob', 'Charlie', 'Diana'], attendanceData: {} }],
            currentClassIndex: 0
        };
        currentClassIndex = data.currentClassIndex;
        currentClass = data.classes[currentClassIndex];
        teacherName = currentClass.teacher;
        students = currentClass.students;
        attendanceData = currentClass.attendanceData;
        document.getElementById('teacher-name').value = teacherName;
        renderClassSelect();
        renderAttendance();
        renderReports();
        renderViewData();
    }
}

// Save data to server
async function saveDataToServer() {
    try {
        const response = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Gagal menyimpan data: ' + error.message);
    }
}

const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

async function markAttendance(student, status) {
    if (!attendanceData[today]) {
        attendanceData[today] = [];
    }
    if (status === 'present') {
        if (!attendanceData[today].includes(student)) {
            attendanceData[today].push(student);
        }
    } else {
        const index = attendanceData[today].indexOf(student);
        if (index > -1) {
            attendanceData[today].splice(index, 1);
        }
    }
    currentClass.attendanceData = attendanceData;
    data.classes[currentClassIndex] = currentClass;
    renderAttendance();
    renderReports();
    renderViewData();
}

function renderAttendance() {
    const studentList = document.getElementById('student-list');
    studentList.innerHTML = '';
    students.forEach(student => {
        const div = document.createElement('div');
        div.className = 'student';
        div.innerHTML = `
            <span>${student}</span>
            <div>
                <button class="present-btn" onclick="markAttendance('${student}', 'present')">Present</button>
                <button class="absent-btn" onclick="markAttendance('${student}', 'absent')">Absent</button>
                <button class="remove-btn" onclick="removeStudent('${student}')">Hapus</button>
            </div>
        `;
        studentList.appendChild(div);
    });
}

function renderReports() {
    const reports = document.getElementById('reports');
    reports.innerHTML = '';
    const totalDays = Object.keys(attendanceData).length;
    students.forEach(student => {
        let presentDays = 0;
        Object.values(attendanceData).forEach(day => {
            if (day.includes(student)) {
                presentDays++;
            }
        });
        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
        const div = document.createElement('div');
        div.className = 'report-item';
        div.innerHTML = `${student}: ${presentDays}/${totalDays} days (${percentage}%)`;
        reports.appendChild(div);
    });
}

function renderViewData() {
    const viewData = document.getElementById('view-data');
    viewData.innerHTML = '';
    const presentToday = attendanceData[today] || [];
    const absentToday = students.filter(s => !presentToday.includes(s));
    const todayDate = new Date().toLocaleDateString('id-ID');
    const div = document.createElement('div');
    div.innerHTML = `
        <p><strong>Nama Guru:</strong> ${teacherName || 'Belum disimpan'}</p>
        <p><strong>Kelas Saat Ini:</strong> ${currentClass.name}</p>
        <p><strong>Murid:</strong> ${students.length > 0 ? students.join(', ') : 'Belum ada'}</p>
        <p><strong>Data Absen:</strong> ${Object.keys(attendanceData).length} hari tercatat</p>
        <p><strong>Hadir Hari Ini (${todayDate}):</strong> ${presentToday.length > 0 ? presentToday.join(', ') : 'Belum ada'}</p>
        <p><strong>Tidak Hadir Hari Ini (${todayDate}):</strong> ${absentToday.length > 0 ? absentToday.join(', ') : 'Semua hadir'}</p>
    `;
    viewData.appendChild(div);
}

function exportToExcel() {
    const now = new Date();
    const exportDateTime = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`;
    const data = [
        { Date: 'Teacher', Present: teacherName, Absent: '' },
        { Date: 'Class', Present: currentClass.name, Absent: '' },
        { Date: 'Exported on', Present: exportDateTime, Absent: '' },
        { Date: '', Present: '', Absent: '' }
    ];

    // Add daily attendance
    const dates = Object.keys(attendanceData).sort();
    dates.forEach(date => {
        const present = attendanceData[date];
        const absent = students.filter(s => !present.includes(s));
        data.push({
            Date: date,
            Present: present.join(', '),
            Absent: absent.join(', ')
        });
    });

    // Add summary
    data.push({ Date: '', Present: '', Absent: '' });
    data.push({ Date: 'Summary', Present: '', Absent: '' });
    students.forEach(student => {
        const totalDays = dates.length;
        let presentDays = 0;
        dates.forEach(date => {
            if (attendanceData[date].includes(student)) {
                presentDays++;
            }
        });
        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
        data.push({
            Date: student,
            Present: `${presentDays}/${totalDays}`,
            Absent: `${percentage}%`
        });
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `attendance_report_${dateStr}.xlsx`);
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const now = new Date();
    const exportDateTime = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`;
    doc.text('Attendance Report', 10, 10);
    doc.text(`Teacher: ${teacherName}`, 10, 20);
    doc.text(`Class: ${currentClass.name}`, 10, 25);
    doc.text(`Exported on: ${exportDateTime}`, 10, 35);
    let y = 45;

    // Daily attendance
    const dates = Object.keys(attendanceData).sort();
    dates.forEach(date => {
        const present = attendanceData[date];
        const absent = students.filter(s => !present.includes(s));
        doc.text(`${date}: Present - ${present.join(', ')}`, 10, y);
        y += 10;
        doc.text(`Absent - ${absent.join(', ')}`, 10, y);
        y += 10;
    });

    y += 10;
    doc.text('Summary:', 10, y);
    y += 10;
    students.forEach(student => {
        const totalDays = dates.length;
        let presentDays = 0;
        dates.forEach(date => {
            if (attendanceData[date].includes(student)) {
                presentDays++;
            }
        });
        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
        doc.text(`${student}: ${presentDays}/${totalDays} (${percentage}%)`, 10, y);
        y += 10;
    });
    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`attendance_report_${dateStr}.pdf`);
}

function exportData() {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                data = importedData;
                teacherName = data.classes[data.currentClassIndex].teacher;
                students = data.classes[data.currentClassIndex].students;
                attendanceData = data.classes[data.currentClassIndex].attendanceData;
                document.getElementById('teacher-name').value = teacherName;
                renderClassSelect();
                renderAttendance();
                renderReports();
                renderViewData();
                alert('Data berhasil diimpor!');
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

document.getElementById('export-excel').addEventListener('click', exportToExcel);
document.getElementById('export-pdf').addEventListener('click', exportToPDF);
document.getElementById('export-data').addEventListener('click', exportData);
document.getElementById('import-data-btn').addEventListener('click', () => document.getElementById('import-data').click());
document.getElementById('import-data').addEventListener('change', importData);
document.getElementById('print-page').addEventListener('click', () => window.print());
document.getElementById('save-data').addEventListener('click', async () => {
    await saveDataToServer();
    alert('Data berhasil disimpan!');
});

// Display current date and time
function updateDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString('id-ID');
    const time = now.toLocaleTimeString('id-ID');
    document.getElementById('current-date').innerText = `Tanggal: ${date} | Waktu: ${time}`;
}
updateDateTime();
setInterval(updateDateTime, 1000);

// Functions for teacher and students
async function saveTeacher() {
    const input = document.getElementById('teacher-name');
    teacherName = input.value.trim();
    currentClass.teacher = teacherName;
    data.classes[currentClassIndex] = currentClass;
    renderViewData();
    alert('Nama guru disimpan!');
}

async function addClass() {
    const input = document.getElementById('new-class');
    const name = input.value.trim();
    if (name && !data.classes.some(c => c.name === name)) {
        data.classes.push({ name: name, teacher: '', students: [], attendanceData: {} });
        input.value = '';
        renderClassSelect();
        alert('Kelas baru ditambahkan!');
    } else {
        alert('Nama kelas tidak valid atau sudah ada!');
    }
}

async function deleteClass() {
    if (data.classes.length > 1) {
        data.classes.splice(currentClassIndex, 1);
        currentClassIndex = Math.min(currentClassIndex, data.classes.length - 1);
        currentClass = data.classes[currentClassIndex];
        teacherName = currentClass.teacher;
        students = currentClass.students;
        attendanceData = currentClass.attendanceData;
        data.currentClassIndex = currentClassIndex;
        document.getElementById('teacher-name').value = teacherName;
        renderClassSelect();
        renderAttendance();
        renderReports();
        renderViewData();
        alert('Kelas dihapus!');
    } else {
        alert('Tidak bisa menghapus kelas terakhir!');
    }
}

async function selectClass(index) {
    currentClassIndex = index;
    currentClass = data.classes[currentClassIndex];
    teacherName = currentClass.teacher;
    students = currentClass.students;
    attendanceData = currentClass.attendanceData;
    data.currentClassIndex = currentClassIndex;
    document.getElementById('teacher-name').value = teacherName;
    renderClassSelect();
    renderAttendance();
    renderReports();
    renderViewData();
}

function renderClassSelect() {
    const select = document.getElementById('class-select');
    select.innerHTML = '';
    data.classes.forEach((cls, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = cls.name;
        if (index === currentClassIndex) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

async function addStudent() {
    const input = document.getElementById('new-student');
    const name = input.value.trim();
    if (name && !students.includes(name)) {
        students.push(name);
        currentClass.students = students;
        data.classes[currentClassIndex] = currentClass;
        input.value = '';
        renderAttendance();
        renderReports();
        renderViewData();
    } else {
        alert('Nama murid tidak valid atau sudah ada!');
    }
}

async function removeStudent(student) {
    students = students.filter(s => s !== student);
    // Also remove from attendance data
    Object.keys(attendanceData).forEach(day => {
        attendanceData[day] = attendanceData[day].filter(s => s !== student);
    });
    currentClass.students = students;
    currentClass.attendanceData = attendanceData;
    data.classes[currentClassIndex] = currentClass;
    renderAttendance();
    renderReports();
    renderViewData();
}

document.getElementById('save-teacher').addEventListener('click', saveTeacher);
document.getElementById('add-student').addEventListener('click', addStudent);
document.getElementById('add-class').addEventListener('click', addClass);
document.getElementById('delete-class').addEventListener('click', deleteClass);
document.getElementById('class-select').addEventListener('change', (e) => selectClass(parseInt(e.target.value)));

// Load initial data
window.addEventListener('load', loadDataFromServer);
