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
        attendanceData[today] = { hadir: [], alpha: [], sakit: [], izin: [] };
    }
    
    // Remove from all categories first
    ['hadir', 'alpha', 'sakit', 'izin'].forEach(s => {
        attendanceData[today][s] = attendanceData[today][s].filter(name => name !== student);
    });
    
    // Add to selected status
    if (status && attendanceData[today][status]) {
        attendanceData[today][status].push(student);
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
        
        // Get current status for this student
        let currentStatus = null;
        if (attendanceData[today]) {
            if (attendanceData[today].hadir?.includes(student)) currentStatus = 'hadir';
            else if (attendanceData[today].alpha?.includes(student)) currentStatus = 'alpha';
            else if (attendanceData[today].sakit?.includes(student)) currentStatus = 'sakit';
            else if (attendanceData[today].izin?.includes(student)) currentStatus = 'izin';
        }
        
        div.innerHTML = `
            <span>${student}</span>
            <div>
                <button class="btn-status ${currentStatus === 'hadir' ? 'active' : ''}" onclick="markAttendance('${student}', 'hadir')">✓ Hadir</button>
                <button class="btn-status ${currentStatus === 'alpha' ? 'active' : ''}" onclick="markAttendance('${student}', 'alpha')">✗ Alpha</button>
                <button class="btn-status ${currentStatus === 'sakit' ? 'active' : ''}" onclick="markAttendance('${student}', 'sakit')">🏥 Sakit</button>
                <button class="btn-status ${currentStatus === 'izin' ? 'active' : ''}" onclick="markAttendance('${student}', 'izin')">📄 Izin</button>
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
        let hariDays = 0;
        Object.values(attendanceData).forEach(day => {
            if (day.hadir?.includes(student)) {
                hariDays++;
            }
        });
        const percentage = totalDays > 0 ? ((hariDays / totalDays) * 100).toFixed(2) : 0;
        const div = document.createElement('div');
        div.className = 'report-item';
        div.innerHTML = `${student}: ${hariDays} Hadir / ${totalDays} hari (${percentage}%)`;
        reports.appendChild(div);
    });
}

function renderViewData() {
    const viewData = document.getElementById('view-data');
    viewData.innerHTML = '';
    const todayData = attendanceData[today] || { hadir: [], alpha: [], sakit: [], izin: [] };
    const hariToday = todayData.hadir || [];
    const alphaToday = todayData.alpha || [];
    const sakitToday = todayData.sakit || [];
    const izinToday = todayData.izin || [];
    const todayDate = new Date().toLocaleDateString('id-ID');
    const div = document.createElement('div');
    div.innerHTML = `
        <p><strong>👨‍🏫 Nama Guru:</strong> ${teacherName || 'Belum disimpan'}</p>
        <p><strong>📚 Kelas Saat Ini:</strong> ${currentClass ? currentClass.name : 'Belum ada kelas'}</p>
        <p><strong>👥 Total Murid:</strong> ${students.length > 0 ? students.length : '0'}</p>
        <p><strong>📅 Total Hari Kerja:</strong> ${Object.keys(attendanceData).length} hari</p>
        <p><strong>✓ Hadir (${todayDate}):</strong> ${hariToday.length > 0 ? hariToday.join(', ') : '-'}</p>
        <p><strong>✗ Alpha (${todayDate}):</strong> ${alphaToday.length > 0 ? alphaToday.join(', ') : '-'}</p>
        <p><strong>🏥 Sakit (${todayDate}):</strong> ${sakitToday.length > 0 ? sakitToday.join(', ') : '-'}</p>
        <p><strong>📄 Izin (${todayDate}):</strong> ${izinToday.length > 0 ? izinToday.join(', ') : '-'}</p>
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
    summaryData.push(['No', 'Nama Siswa', 'Hadir', 'Alpha', 'Sakit', 'Izin', 'Total Hari', 'Persentase']);
    students.forEach((student, idx) => {
        const totalDays = dates.length;
        let hariDays = 0, alphaDays = 0, sakitDays = 0, izinDays = 0;
        dates.forEach(date => {
            const dayData = attendanceData[date] || { hadir: [], alpha: [], sakit: [], izin: [] };
            if (dayData.hadir?.includes(student)) hariDays++;
            if (dayData.alpha?.includes(student)) alphaDays++;
            if (dayData.sakit?.includes(student)) sakitDays++;
            if (dayData.izin?.includes(student)) izinDays++;
        });
        const percentage = totalDays > 0 ? ((hariDays / totalDays) * 100).toFixed(2) : 0;
        summaryData.push([
            idx + 1,
            student,
            hariDays,
            alphaDays,
            sakitDays,
            izinDays,
            totalDays,
            `${percentage}%`
        ]);
    });
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 15 }];    
    // Style summary table header
    for (let i = 0; i < 8; i++) {
        const cellRef = XLSX.utils.encode_col(i) + '1';
        if (ws1[cellRef]) {
            ws1[cellRef].s = {
                fill: { fgColor: { rgb: 'FF4472C4' } },
                font: { bold: true, color: { rgb: 'FFFFFFFF' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'FF000000' } },
                    bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                    left: { style: 'thin', color: { rgb: 'FF000000' } },
                    right: { style: 'thin', color: { rgb: 'FF000000' } }
                }
            };
        }
    }    
    // Set header styling
    for (let i = 0; i < 8; i++) {
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
        const dayData = attendanceData[date] || { hadir: [], alpha: [], sakit: [], izin: [] };
        students.forEach(student => {
            if (dayData.hadir?.includes(student)) {
                row.push('Hadir');
            } else if (dayData.alpha?.includes(student)) {
                row.push('Alpha');
            } else if (dayData.sakit?.includes(student)) {
                row.push('Sakit');
            } else if (dayData.izin?.includes(student)) {
                row.push('Izin');
            } else {
                row.push('-');
            }
        });
        detailData.push(row);
    });
    
    const ws2 = XLSX.utils.aoa_to_sheet(detailData);
    ws2['!cols'] = [{ wch: 15 }, ...students.map(() => ({ wch: 15 }))];
    
    // Style detail table header
    for (let i = 0; i <= students.length; i++) {
        const cellRef = XLSX.utils.encode_col(i) + '1';
        if (ws2[cellRef]) {
            ws2[cellRef].s = {
                fill: { fgColor: { rgb: 'FF70AD47' } },
                font: { bold: true, color: { rgb: 'FFFFFFFF' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'FF000000' } },
                    bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                    left: { style: 'thin', color: { rgb: 'FF000000' } },
                    right: { style: 'thin', color: { rgb: 'FF000000' } }
                }
            };
        }
    }
    
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
        let hariDays = 0;
        let alphaDays = 0;
        let sakitDays = 0;
        let izinDays = 0;
        
        dates.forEach(date => {
            const dayData = attendanceData[date] || { hadir: [], alpha: [], sakit: [], izin: [] };
            if (dayData.hadir?.includes(student)) hariDays++;
            else if (dayData.alpha?.includes(student)) alphaDays++;
            else if (dayData.sakit?.includes(student)) sakitDays++;
            else if (dayData.izin?.includes(student)) izinDays++;
        });
        
        const percentage = totalDays > 0 ? ((hariDays / totalDays) * 100).toFixed(2) : 0;
        summaryTable.push([
            (idx + 1).toString(),
            student,
            hariDays.toString(),
            alphaDays.toString(),
            sakitDays.toString(),
            izinDays.toString(),
            totalDays.toString(),
            `${percentage}%`
        ]);
    });
    
    doc.autoTable({
        head: [['No', 'Nama Siswa', 'Hadir', 'Alpha', 'Sakit', 'Izin', 'Total', 'Persentase']],
        body: summaryTable.slice(1),
        startY: yPos,
        margin: { left: 15, right: 15 },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 55, halign: 'left' },
            2: { cellWidth: 14, halign: 'center', fillColor: [76, 175, 80] },
            3: { cellWidth: 14, halign: 'center', fillColor: [244, 67, 54] },
            4: { cellWidth: 14, halign: 'center', fillColor: [255, 152, 0] },
            5: { cellWidth: 14, halign: 'center', fillColor: [156, 39, 176] },
            6: { cellWidth: 12, halign: 'center' },
            7: { cellWidth: 16, halign: 'center' }
        },
        headStyles: { fillColor: [66, 133, 244], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', valign: 'middle' },
        bodyStyles: { textColor: [0, 0, 0], valign: 'middle' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didDrawPage: (data) => {
            const footer = 'Halaman ' + (doc.internal.getNumberOfPages());
            doc.setFontSize(9);
            doc.text(footer, 195, 280, { align: 'right' });
        }
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
            const dayData = attendanceData[date] || { hadir: [], alpha: [], sakit: [], izin: [] };
            students.slice(0, 4).forEach(student => {
                if (dayData.hadir?.includes(student)) row.push('✓ H');
                else if (dayData.alpha?.includes(student)) row.push('✗ A');
                else if (dayData.sakit?.includes(student)) row.push('🏥 S');
                else if (dayData.izin?.includes(student)) row.push('📄 I');
                else row.push('-');
            });
            dailyTable.push(row);
        });
        
        doc.autoTable({
            head: [dailyTable[0]],
            body: dailyTable.slice(1),
            startY: yPos,
            margin: { left: 15, right: 15 },
            columnStyles: {
                0: { cellWidth: 25, halign: 'center', fillColor: [66, 133, 244] },
                1: { halign: 'center', fillColor: [76, 175, 80] },
                2: { halign: 'center', fillColor: [244, 67, 54] },
                3: { halign: 'center', fillColor: [255, 152, 0] },
                4: { halign: 'center', fillColor: [156, 39, 176] }
            },
            headStyles: { fillColor: [33, 33, 33], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', valign: 'middle' },
            bodyStyles: { textColor: [0, 0, 0], valign: 'middle' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            fontSize: 9,
            didDrawPage: (data) => {
                const footer = 'Halaman ' + (doc.internal.getNumberOfPages());
                doc.setFontSize(8);
                doc.text(footer, 195, 280, { align: 'right' });
            }
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
    // Also remove from attendance data from all status arrays
    Object.keys(attendanceData).forEach(day => {
        if (attendanceData[day]) {
            attendanceData[day].hadir = attendanceData[day].hadir?.filter(s => s !== student) || [];
            attendanceData[day].alpha = attendanceData[day].alpha?.filter(s => s !== student) || [];
            attendanceData[day].sakit = attendanceData[day].sakit?.filter(s => s !== student) || [];
            attendanceData[day].izin = attendanceData[day].izin?.filter(s => s !== student) || [];
        }
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
