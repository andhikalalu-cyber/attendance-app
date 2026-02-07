// Global variables
let data = { classes: [], currentClassIndex: 0 };
let currentClassIndex = 0;
let currentClass = null;
let teacherName = '';
let students = [];
let attendanceData = {};
const today = new Date().toISOString().split('T')[0];

// Initialize on page load
window.addEventListener('load', async () => {
    console.log('App loaded');
    await loadDataFromServer();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

// ===== DATA MANAGEMENT =====
async function loadDataFromServer() {
    try {
        const response = await fetch('/.netlify/functions/api-data');
        if (!response.ok) throw new Error('Network error');
        data = await response.json();
        currentClassIndex = data.currentClassIndex || 0;
        
        if (data.classes && data.classes.length > 0) {
            currentClass = data.classes[currentClassIndex];
            teacherName = currentClass.teacher || '';
            students = currentClass.students || [];
            attendanceData = currentClass.attendanceData || {};
            document.getElementById('teacher-name').value = teacherName;
        }
    } catch (error) {
        console.error('Error loading data:', error);
        data = { classes: [], currentClassIndex: 0 };
    }
    
    renderClassSelect();
    renderAttendance();
    renderReports();
    renderViewData();
}

async function saveDataToServer() {
    try {
        await fetch('/.netlify/functions/api-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return true;
    } catch (error) {
        console.error('Error saving:', error);
        return false;
    }
}

// ===== ATTENDANCE FUNCTIONS =====
async function markAttendance(student, status) {
    // Initialize today's data if not exists
    if (!attendanceData[today]) {
        attendanceData[today] = { hadir: [], alpha: [], sakit: [], izin: [] };
    }
    
    // Remove from all status arrays first
    ['hadir', 'alpha', 'sakit', 'izin'].forEach(s => {
        attendanceData[today][s] = attendanceData[today][s].filter(name => name !== student);
    });
    
    // Add to selected status
    if (status) {
        attendanceData[today][status].push(student);
    }
    
    // Update data
    currentClass.attendanceData = attendanceData;
    data.classes[currentClassIndex] = currentClass;
    
    // Auto-save to server
    await saveDataToServer();
    
    renderAttendance();
    renderReports();
    renderViewData();
}

function renderAttendance() {
    const studentList = document.getElementById('student-list');
    studentList.innerHTML = '';
    
    if (!students || students.length === 0) {
        studentList.innerHTML = '<p style="color: #999; padding: 20px;">Belum ada murid</p>';
        return;
    }
    
    students.forEach(student => {
        // Determine current status
        let status = null;
        if (attendanceData[today]) {
            if (attendanceData[today].hadir?.includes(student)) status = 'hadir';
            else if (attendanceData[today].alpha?.includes(student)) status = 'alpha';
            else if (attendanceData[today].sakit?.includes(student)) status = 'sakit';
            else if (attendanceData[today].izin?.includes(student)) status = 'izin';
        }
        
        const div = document.createElement('div');
        div.className = 'student';
        div.innerHTML = `
            <span>${student}</span>
            <div>
                <button class="btn-status ${status === 'hadir' ? 'active' : ''}" onclick="markAttendance('${student}', 'hadir')">✓ Hadir</button>
                <button class="btn-status ${status === 'alpha' ? 'active' : ''}" onclick="markAttendance('${student}', 'alpha')">✗ Alpha</button>
                <button class="btn-status ${status === 'sakit' ? 'active' : ''}" onclick="markAttendance('${student}', 'sakit')">🏥 Sakit</button>
                <button class="btn-status ${status === 'izin' ? 'active' : ''}" onclick="markAttendance('${student}', 'izin')">📄 Izin</button>
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
    if (totalDays === 0) {
        reports.innerHTML = '<p style="color: #999;">Tidak ada data absensi</p>';
        return;
    }
    
    students.forEach(student => {
        let hariDays = 0;
        Object.values(attendanceData).forEach(day => {
            if (day.hadir?.includes(student)) hariDays++;
        });
        
        const percentage = totalDays > 0 ? Math.round((hariDays / totalDays) * 100) : 0;
        const div = document.createElement('div');
        div.className = 'report-item';
        div.innerHTML = `<strong>${student}</strong>: ${hariDays}/${totalDays} hari (${percentage}%)`;
        reports.appendChild(div);
    });
}

function renderViewData() {
    const viewData = document.getElementById('view-data');
    viewData.innerHTML = '';
    
    const todayData = attendanceData[today] || { hadir: [], alpha: [], sakit: [], izin: [] };
    const html = `
        <p><strong>👨‍🏫 Guru:</strong> ${teacherName || '-'}</p>
        <p><strong>📚 Kelas:</strong> ${currentClass?.name || '-'}</p>
        <p><strong>👥 Total Murid:</strong> ${students.length}</p>
        <p><strong>📅 Hari Kerja:</strong> ${Object.keys(attendanceData).length}</p>
        <p><strong>✓ Hadir:</strong> ${todayData.hadir?.length || 0} siswa</p>
        <p><strong>✗ Alpha:</strong> ${todayData.alpha?.length || 0} siswa</p>
        <p><strong>🏥 Sakit:</strong> ${todayData.sakit?.length || 0} siswa</p>
        <p><strong>📄 Izin:</strong> ${todayData.izin?.length || 0} siswa</p>
    `;
    viewData.innerHTML = html;
}

function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID');
    const timeStr = now.toLocaleTimeString('id-ID');
    document.getElementById('current-date').innerText = `${dateStr} | ${timeStr}`;
}

// ===== CLASS MANAGEMENT =====
function renderClassSelect() {
    const select = document.getElementById('class-select');
    select.innerHTML = '';
    
    data.classes.forEach((cls, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = cls.name;
        if (idx === currentClassIndex) option.selected = true;
        select.appendChild(option);
    });
}

function selectClass(idx) {
    currentClassIndex = idx;
    currentClass = data.classes[currentClassIndex];
    teacherName = currentClass.teacher || '';
    students = currentClass.students || [];
    attendanceData = currentClass.attendanceData || {};
    data.currentClassIndex = currentClassIndex;
    
    document.getElementById('teacher-name').value = teacherName;
    renderClassSelect();
    renderAttendance();
    renderReports();
    renderViewData();
}

async function addClass() {
    const input = document.getElementById('new-class');
    const name = input.value.trim();
    
    if (!name) {
        alert('Nama kelas tidak boleh kosong');
        return;
    }
    
    if (data.classes.some(c => c.name === name)) {
        alert('Kelas sudah ada');
        return;
    }
    
    data.classes.push({
        name: name,
        teacher: '',
        students: [],
        attendanceData: {}
    });
    
    input.value = '';
    if (data.classes.length === 1) {
        selectClass(0);
    } else {
        renderClassSelect();
    }
}

async function deleteClass() {
    if (data.classes.length === 1) {
        alert('Tidak bisa menghapus kelas terakhir');
        return;
    }
    
    data.classes.splice(currentClassIndex, 1);
    currentClassIndex = Math.min(currentClassIndex, data.classes.length - 1);
    selectClass(currentClassIndex);
}

async function saveTeacher() {
    const input = document.getElementById('teacher-name');
    teacherName = input.value.trim();
    currentClass.teacher = teacherName;
    data.classes[currentClassIndex] = currentClass;
    alert('Guru disimpan');
}

async function addStudent() {
    const input = document.getElementById('new-student');
    const name = input.value.trim();
    
    if (!name) {
        alert('Nama murid tidak boleh kosong');
        return;
    }
    
    if (students.includes(name)) {
        alert('Murid sudah ada');
        return;
    }
    
    students.push(name);
    currentClass.students = students;
    data.classes[currentClassIndex] = currentClass;
    input.value = '';
    renderAttendance();
    renderReports();
    renderViewData();
}

function removeStudent(student) {
    students = students.filter(s => s !== student);
    
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

// ===== EXPORT FUNCTIONS =====
function exportToExcel() {
    if (!currentClass || students.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }
    
    try {
        const dates = Object.keys(attendanceData).sort();
        const wb = XLSX.utils.book_new();
        
        // Sheet 1: Summary
        const summaryData = [
            ['RINGKASAN ABSENSI'],
            ['Kelas:', currentClass.name],
            ['Guru:', teacherName || '-'],
            ['Tanggal Export:', new Date().toLocaleDateString('id-ID')],
            [''],
            ['No', 'Nama Siswa', 'Hadir', 'Alpha', 'Sakit', 'Izin', 'Total', 'Persentase']
        ];
        
        students.forEach((student, idx) => {
            let h = 0, a = 0, s = 0, i = 0;
            dates.forEach(date => {
                const d = attendanceData[date] || {};
                if (d.hadir?.includes(student)) h++;
                else if (d.alpha?.includes(student)) a++;
                else if (d.sakit?.includes(student)) s++;
                else if (d.izin?.includes(student)) i++;
            });
            const pct = dates.length > 0 ? Math.round((h / dates.length) * 100) : 0;
            summaryData.push([idx + 1, student, h, a, s, i, dates.length, pct + '%']);
        });
        
        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        ws1['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');
        
        // Sheet 2: Detail
        if (dates.length > 0) {
            const detailData = [['Tanggal', ...students]];
            dates.forEach(date => {
                const row = [date];
                const d = attendanceData[date] || {};
                students.forEach(student => {
                    if (d.hadir?.includes(student)) row.push('H');
                    else if (d.alpha?.includes(student)) row.push('A');
                    else if (d.sakit?.includes(student)) row.push('S');
                    else if (d.izin?.includes(student)) row.push('I');
                    else row.push('-');
                });
                detailData.push(row);
            });
            
            const ws2 = XLSX.utils.aoa_to_sheet(detailData);
            ws2['!cols'] = [{ wch: 15 }, ...students.map(() => ({ wch: 10 }))];
            XLSX.utils.book_append_sheet(wb, ws2, 'Detail Harian');
        }
        
        XLSX.writeFile(wb, `Absensi_${currentClass.name}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
        console.error('Excel export error:', error);
        alert('Gagal export Excel: ' + error.message);
    }
}

function exportToPDF() {
    if (!currentClass || students.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }
    
    try {
        const doc = new window.jspdf.jsPDF();
        const dates = Object.keys(attendanceData).sort();
        let yPos = 20;
        
        // Title
        doc.setFontSize(16);
        doc.text('LAPORAN ABSENSI SISWA', 105, yPos, { align: 'center' });
        yPos += 10;
        
        // Info
        doc.setFontSize(11);
        doc.text(`Kelas: ${currentClass.name}`, 20, yPos);
        yPos += 7;
        doc.text(`Guru: ${teacherName || '-'}`, 20, yPos);
        yPos += 7;
        doc.text(`Total Siswa: ${students.length} | Total Hari: ${dates.length}`, 20, yPos);
        yPos += 12;
        
        // Summary Table
        const summaryTable = [];
        summaryTable.push(['No', 'Nama', 'Hadir', 'Alpha', 'Sakit', 'Izin', 'Total', '%']);
        
        students.forEach((student, idx) => {
            let h = 0, a = 0, s = 0, i = 0;
            dates.forEach(date => {
                const d = attendanceData[date] || {};
                if (d.hadir?.includes(student)) h++;
                else if (d.alpha?.includes(student)) a++;
                else if (d.sakit?.includes(student)) s++;
                else if (d.izin?.includes(student)) i++;
            });
            const pct = dates.length > 0 ? Math.round((h / dates.length) * 100) : 0;
            summaryTable.push([
                (idx + 1).toString(),
                student,
                h.toString(),
                a.toString(),
                s.toString(),
                i.toString(),
                dates.length.toString(),
                pct + '%'
            ]);
        });
        
        doc.autoTable({
            head: [summaryTable[0]],
            body: summaryTable.slice(1),
            startY: yPos,
            margin: 15,
            headStyles: { fillColor: [31, 78, 120], textColor: 255, fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [240, 240, 240] }
        });
        
        doc.save(`Absensi_${currentClass.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
        console.error('PDF export error:', error);
        alert('Gagal export PDF: ' + error.message);
    }
}

function exportData() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            data = JSON.parse(e.target.result);
            currentClassIndex = data.currentClassIndex || 0;
            if (data.classes.length > 0) {
                currentClass = data.classes[currentClassIndex];
                teacherName = currentClass.teacher || '';
                students = currentClass.students || [];
                attendanceData = currentClass.attendanceData || {};
            }
            renderClassSelect();
            renderAttendance();
            renderReports();
            renderViewData();
            alert('Data berhasil diimpor');
        } catch (error) {
            alert('Error import: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('save-teacher')?.addEventListener('click', saveTeacher);
    document.getElementById('add-class')?.addEventListener('click', addClass);
    document.getElementById('delete-class')?.addEventListener('click', deleteClass);
    document.getElementById('add-student')?.addEventListener('click', addStudent);
    document.getElementById('class-select')?.addEventListener('change', (e) => selectClass(parseInt(e.target.value)));
    document.getElementById('export-excel')?.addEventListener('click', exportToExcel);
    document.getElementById('export-pdf')?.addEventListener('click', exportToPDF);
    document.getElementById('export-data')?.addEventListener('click', exportData);
    document.getElementById('import-data-btn')?.addEventListener('click', () => document.getElementById('import-data')?.click());
    document.getElementById('import-data')?.addEventListener('change', importData);
    document.getElementById('print-page')?.addEventListener('click', () => window.print());
    document.getElementById('save-data')?.addEventListener('click', async () => {
        const ok = await saveDataToServer();
        alert(ok ? 'Data disimpan' : 'Gagal simpan');
    });
});
