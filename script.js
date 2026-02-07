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
    // Quiet diagnostics on load (logs only)
    try {
        const jspdfPresent = !!window.jspdf;
        console.log('Diagnostics (quiet): window.jspdf =', jspdfPresent);
        if (jspdfPresent && window.jspdf.jsPDF) {
            try {
                const doc = new window.jspdf.jsPDF();
                console.log('Diagnostics (quiet): doc.autoTable =', typeof doc.autoTable === 'function');
            } catch (e) {
                console.log('Diagnostics (quiet): failed to instantiate jsPDF:', e.message);
            }
        } else {
            console.log('Diagnostics (quiet): window.jspdf.jsPDF missing');
        }
    } catch (e) {
        console.log('Diagnostics (quiet) error:', e.message);
    }
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
async function ensureAutoTableAvailable(timeoutMs = 5000) {
    try {
        // Quick check: already attached
        if (window.jspdf && window.jspdf.jsPDF && typeof window.jspdf.jsPDF.prototype.autoTable === 'function') return true;

        // Try to copy from API if present
        if (window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API && typeof window.jspdf.jsPDF.API.autoTable === 'function') {
            window.jspdf.jsPDF.prototype.autoTable = window.jspdf.jsPDF.API.autoTable;
            return true;
        }

        // Try some known global plugin names
        const possible = [window.jspdfAutoTable, window.jspdfAutotable, window.jspdfPlugin, window.jspdfPluginAutoTable, window.jspdf_autotable];
        for (const p of possible) {
            if (p && typeof p === 'function') {
                // attempt to attach
                if (window.jspdf && window.jspdf.jsPDF) {
                    window.jspdf.jsPDF.prototype.autoTable = p;
                    return true;
                }
            }
        }

        // Dynamically load plugin scripts (try multiple CDNs)
        const urls = [
            'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/dist/jspdf.plugin.autotable.js?v=20260207.1',
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js?v=20260207.1'
        ];

        for (const url of urls) {
            // skip if already added exactly
            if (document.querySelector(`script[src="${url}"]`)) continue;
            const loaded = await new Promise((resolve) => {
                const s = document.createElement('script');
                s.src = url;
                s.async = true;
                s.onload = () => resolve(true);
                s.onerror = () => resolve(false);
                document.head.appendChild(s);
                // safety timeout
                setTimeout(() => resolve(false), timeoutMs);
            });
            if (loaded && window.jspdf && window.jspdf.jsPDF && typeof window.jspdf.jsPDF.prototype.autoTable === 'function') return true;
        }

        return false;
    } catch (err) {
        console.warn('ensureAutoTableAvailable error', err);
        return false;
    }
}

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

async function exportToPDF() {
    // ensure autotable is attached if possible
    await ensureAutoTableAvailable();
    if (!currentClass || students.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }
    
    // First try server-side PDF generation
    try {
        const payload = { currentClass, students, attendanceData, teacherName };
        const resp = await fetch('/.netlify/functions/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (resp.ok) {
            const arrayBuffer = await resp.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Absensi_${currentClass.name}_${new Date().toISOString().slice(0,10)}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            return;
        }
        // if server fails, fallback to client-side below
    } catch (err) {
        console.warn('Server PDF generation failed, falling back to client methods', err);
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
        
        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                head: [summaryTable[0]],
                body: summaryTable.slice(1),
                startY: yPos,
                margin: 15,
                headStyles: { fillColor: [31, 78, 120], textColor: 255, fontSize: 10 },
                bodyStyles: { fontSize: 9 },
                alternateRowStyles: { fillColor: [240, 240, 240] }
            });
        } else if (window.html2pdf) {
            // Use html2pdf as a better formatted fallback
            console.warn('autoTable missing — using html2pdf fallback');
            const container = document.createElement('div');
            container.style.padding = '20px';
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.fontSize = '12px';
            const title = document.createElement('h2');
            title.innerText = 'LAPORAN ABSENSI SISWA';
            title.style.textAlign = 'center';
            container.appendChild(title);

            const info = document.createElement('p');
            info.innerText = `Kelas: ${currentClass.name} | Guru: ${teacherName || '-'} | Total Siswa: ${students.length} | Total Hari: ${dates.length}`;
            container.appendChild(info);

            const table = document.createElement('table');
            table.style.borderCollapse = 'collapse';
            table.style.width = '100%';
            table.style.marginTop = '8px';

            const thead = document.createElement('thead');
            const thr = document.createElement('tr');
            summaryTable[0].forEach(h => {
                const th = document.createElement('th');
                th.innerText = h;
                th.style.border = '1px solid #333';
                th.style.padding = '6px';
                th.style.background = '#1f4e78';
                th.style.color = '#fff';
                th.style.fontWeight = '600';
                thr.appendChild(th);
            });
            thead.appendChild(thr);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            summaryTable.slice(1).forEach(row => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const td = document.createElement('td');
                    td.innerText = cell;
                    td.style.border = '1px solid #ccc';
                    td.style.padding = '6px';
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.appendChild(table);

            document.body.appendChild(container);
            const opt = {
                margin:       10,
                filename:     `Absensi_${currentClass.name}_${new Date().toISOString().slice(0,10)}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            try {
                await html2pdf().set(opt).from(container).save();
            } catch (e) {
                console.error('html2pdf error:', e);
                alert('Gagal export PDF via html2pdf: ' + e.message);
            } finally {
                document.body.removeChild(container);
            }
        } else {
            // Last-resort manual rendering (keeps previous simple fallback)
            console.warn('No PDF plugin available — using manual jsPDF rendering');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const colWidths = [10, 60, 18, 18, 18, 18, 18, 20];
            const rowHeight = 7;
            let xStart = margin;
            let y = yPos;

            doc.setFontSize(10);
            // header row
            doc.setFont(undefined, 'bold');
            summaryTable[0].forEach((cell, ci) => {
                const w = colWidths[ci] || 30;
                doc.text(String(cell), xStart + 2, y + 4);
                xStart += w;
            });
            doc.setFont(undefined, 'normal');
            y += rowHeight;

            // body rows
            for (let r = 1; r < summaryTable.length; r++) {
                if (y + rowHeight > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                const row = summaryTable[r];
                let x = margin;
                row.forEach((cell, ci) => {
                    const w = colWidths[ci] || 30;
                    const text = String(cell);
                    // truncate long text to fit column
                    const maxChars = Math.floor((w - 4) / 1.8);
                    const out = text.length > maxChars ? text.slice(0, maxChars - 3) + '...' : text;
                    doc.text(out, x + 2, y + 4);
                    x += w;
                });
                y += rowHeight;
            }
        }
        
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

// ===== DIAGNOSTICS =====
function runDiagnostics() {
    const results = [];
    const jspdfPresent = !!window.jspdf;
    results.push(`window.jspdf: ${jspdfPresent ? 'OK' : 'missing'}`);
    try {
        if (jspdfPresent && window.jspdf.jsPDF) {
            results.push('window.jspdf.jsPDF: OK');
            try {
                const doc = new window.jspdf.jsPDF();
                const autoTableAvailable = typeof doc.autoTable === 'function';
                results.push(`doc.autoTable: ${autoTableAvailable ? 'OK' : 'missing'}`);
            } catch (e) {
                results.push('Error creating jsPDF instance: ' + e.message);
            }
        } else {
            results.push('window.jspdf.jsPDF: missing');
            results.push('doc.autoTable: unknown (jsPDF missing)');
        }
    } catch (err) {
        results.push('Diagnostics error: ' + err.message);
    }

    const msg = results.join('\n');
    console.log('Diagnostics:', results);
    alert('Diagnostic hasil:\n' + msg + '\n\nJika ada yang "missing", coba hard-refresh (Ctrl+Shift+R) atau buka di browser lain.');
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
    document.getElementById('diagnostic-btn')?.addEventListener('click', runDiagnostics);
});
