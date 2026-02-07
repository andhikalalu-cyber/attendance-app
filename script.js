// Load data from server
async function loadDataFromServer() {
    try {
        const response = await fetch('/.netlify/functions/api-data');
        data = await response.json();
        currentClassIndex = data.currentClassIndex;
        if (data.classes.length > 0) {
            currentClass = data.classes[currentClassIndex];
            teacherName = currentClass.teacher;
            students = currentClass.students;
            attendanceData = currentClass.attendanceData;
            document.getElementById('teacher-name').value = teacherName;
        } else {
            currentClass = null;
            teacherName = '';
            students = [];
            attendanceData = {};
            document.getElementById('teacher-name').value = '';
        }
        renderClassSelect();
        renderAttendance();
        renderReports();
        renderViewData();
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to default
        data = {
            classes: [],
            currentClassIndex: 0
        };
        currentClassIndex = data.currentClassIndex;
        if (data.classes.length > 0) {
            currentClass = data.classes[currentClassIndex];
            teacherName = currentClass.teacher;
            students = currentClass.students;
            attendanceData = currentClass.attendanceData;
            document.getElementById('teacher-name').value = teacherName;
        } else {
            currentClass = null;
            teacherName = '';
            students = [];
            attendanceData = {};
            document.getElementById('teacher-name').value = '';
        }
        renderClassSelect();
        renderAttendance();
        renderReports();
        renderViewData();
    }
}

// Save data to server
async function saveDataToServer() {
    try {
        const response = await fetch('/.netlify/functions/api-data', {
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
        <p><strong>Kelas Saat Ini:</strong> ${currentClass ? currentClass.name : 'Belum ada kelas'}</p>
        <p><strong>Murid:</strong> ${students.length > 0 ? students.join(', ') : 'Belum ada'}</p>
        <p><strong>Data Absen:</strong> ${Object.keys(attendanceData).length} hari tercatat</p>
        <p><strong>Hadir Hari Ini (${todayDate}):</strong> ${presentToday.length > 0 ? presentToday.join(', ') : 'Belum ada'}</p>
        <p><strong>Tidak Hadir Hari Ini (${todayDate}):</strong> ${absentToday.length > 0 ? absentToday.join(', ') : 'Semua hadir'}</p>
    `;
    viewData.appendChild(div);
}

function exportToExcel() {
    if (!currentClass) {
        alert('Tidak ada kelas yang dipilih!');
        return;
    }
    const now = new Date();
    const exportDateTime = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`;
    const dates = Object.keys(attendanceData).sort();
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // SHEET 1: HEADER & SUMMARY
    const summaryData = [
        ['LAPORAN ABSENSI SISWA'],
        [''],
        ['Sekolah:', 'SMK Yarsi Mataram'],
        ['Guru:', teacherName || '-'],
        ['Kelas:', currentClass.name],
        ['Tanggal Export:', exportDateTime],
        ['Total Siswa:', students.length],
        ['Total Hari Kerja:', dates.length],
        [''],
        ['RINGKASAN KEHADIRAN']
    ];
    
    // Add summary data
    summaryData.push(['No', 'Nama Siswa', 'Hadir', 'Total Hari', 'Persentase']);
    students.forEach((student, idx) => {
        const totalDays = dates.length;
        let presentDays = 0;
        dates.forEach(date => {
            if (attendanceData[date].includes(student)) {
                presentDays++;
            }
        });
        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
        summaryData.push([
            idx + 1,
            student,
            presentDays,
            totalDays,
            `${percentage}%`
        ]);
    });
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
    
    // Set header styling
    for (let i = 0; i < 5; i++) {
        const cell = ws1[XLSX.utils.encode_col(i) + '10'];
        if (cell) cell.s = { bold: true, fill: { fgColor: { rgb: 'FFD966' } }, alignment: { horizontal: 'center' } };
    }
    
    XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');
    
    // SHEET 2: DETAIL HARIAN
    const detailData = [
        ['DETAIL ABSENSI HARIAN'],
        [''],
        ['Kelas:', currentClass.name]
    ];
    
    // Create date-wise detail
    detailData.push(['']);
    detailData.push(['Tanggal', ...students]);
    
    dates.forEach(date => {
        const row = [date];
        students.forEach(student => {
            if (attendanceData[date].includes(student)) {
                row.push('Hadir');
            } else {
                row.push('Absen');
            }
        });
        detailData.push(row);
    });
    
    const ws2 = XLSX.utils.aoa_to_sheet(detailData);
    ws2['!cols'] = [{ wch: 15 }, ...students.map(() => ({ wch: 15 }))];
    
    XLSX.utils.book_append_sheet(wb, ws2, 'Detail Harian');
    
    // Save file
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Absensi_${currentClass.name}_${dateStr}.xlsx`);
}

function exportToPDF() {
    if (!currentClass) {
        alert('Tidak ada kelas yang dipilih!');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const now = new Date();
    const exportDateTime = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`;
    const dates = Object.keys(attendanceData).sort();
    
    let yPos = 20;
    
    // Header
    doc.setFontSize(16);
    doc.text('LAPORAN ABSENSI SISWA', 105, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text('SMK Yarsi Mataram', 105, yPos, { align: 'center' });
    yPos += 8;
    
    // Info box
    doc.setDrawColor(100, 150, 200);
    doc.rect(15, yPos, 180, 28);
    doc.setFontSize(9);
    yPos += 4;
    doc.text(`Guru: ${teacherName || '-'}`, 20, yPos);
    yPos += 6;
    doc.text(`Kelas: ${currentClass.name}`, 20, yPos);
    yPos += 6;
    doc.text(`Tanggal Export: ${exportDateTime}`, 20, yPos);
    yPos += 6;
    doc.text(`Total Siswa: ${students.length} | Total Hari: ${dates.length}`, 20, yPos);
    yPos += 12;
    
    // Summary Table
    doc.setFontSize(11);
    doc.text('RINGKASAN KEHADIRAN', 15, yPos);
    yPos += 8;
    
    const summaryTable = [];
    summaryTable.push(['No', 'Nama Siswa', 'Hadir', 'Total', 'Persentase']);
    
    students.forEach((student, idx) => {
        const totalDays = dates.length;
        let presentDays = 0;
        dates.forEach(date => {
            if (attendanceData[date].includes(student)) {
                presentDays++;
            }
        });
        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;
        summaryTable.push([
            (idx + 1).toString(),
            student,
            presentDays.toString(),
            totalDays.toString(),
            `${percentage}%`
        ]);
    });
    
    doc.autoTable({
        head: [summaryTable[0]],
        body: summaryTable.slice(1),
        startY: yPos,
        margin: { left: 15, right: 15 },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 90, halign: 'left' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 28, halign: 'center' }
        },
        headStyles: { fillColor: [100, 150, 200], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
        bodyStyles: { textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add new page for daily details if needed
    if (dates.length > 0) {
        yPos = doc.lastAutoTable.finalY + 15;
        
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(11);
        doc.text('DETAIL ABSENSI HARIAN', 15, yPos);
        yPos += 8;
        
        // Daily table
        const dailyTable = [];
        dailyTable.push(['Tanggal', ...students.slice(0, 4)]);
        
        dates.forEach(date => {
            const row = [date];
            students.slice(0, 4).forEach(student => {
                row.push(attendanceData[date].includes(student) ? '✓ H' : '✗ A');
            });
            dailyTable.push(row);
        });
        
        doc.autoTable({
            head: [dailyTable[0]],
            body: dailyTable.slice(1),
            startY: yPos,
            margin: { left: 15, right: 15 },
            headStyles: { fillColor: [100, 150, 200], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            bodyStyles: { textColor: [0, 0, 0] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            fontSize: 8
        });
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 15, 290);
    }
    
    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`Absensi_${currentClass.name}_${dateStr}.pdf`);
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
                if (data.classes.length > 0) {
                    teacherName = data.classes[data.currentClassIndex].teacher;
                    students = data.classes[data.currentClassIndex].students;
                    attendanceData = data.classes[data.currentClassIndex].attendanceData;
                    document.getElementById('teacher-name').value = teacherName;
                } else {
                    teacherName = '';
                    students = [];
                    attendanceData = {};
                    document.getElementById('teacher-name').value = '';
                }
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
    if (!currentClass) {
        alert('Pilih kelas dulu!');
        return;
    }
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
        if (data.classes.length === 1) {
            selectClass(0);
        } else {
            renderClassSelect();
        }
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
