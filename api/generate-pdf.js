const PDFDocument = require('pdfkit');

module.exports = async function(req, res) {
  try {
    const payload = req.body || {};
    const { currentClass = {}, students = [], attendanceData = {}, teacherName = '' } = payload;
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const finishPromise = new Promise((resolve, reject) => {
      doc.on('end', () => resolve());
      doc.on('error', (err) => reject(err));
    });
    doc.fontSize(16).text('LAPORAN ABSENSI SISWA', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Kelas: ${currentClass.name || '-'}    Guru: ${teacherName || '-'}    Total Siswa: ${students.length}    Total Hari: ${Object.keys(attendanceData).length}`);
    doc.moveDown(0.5);
    const tableTop = doc.y + 6;
    const colX = [40, 80, 260, 320, 380, 440, 500, 540];
    doc.fontSize(9).font('Helvetica-Bold');
    ['No', 'Nama', 'Hadir', 'Alpha', 'Sakit', 'Izin', 'Total', '%'].forEach((h, i) => {
      doc.text(h, colX[i], tableTop, { width: (i === 1 ? 160 : 40), align: 'left' });
    });
    doc.moveDown(1);
    doc.font('Helvetica');
    const dates = Object.keys(attendanceData).sort();
    let rowY = doc.y;
    const rowHeight = 14;
    students.forEach((student, idx) => {
      if (rowY + rowHeight > doc.page.height - 60) {
        doc.addPage();
        rowY = doc.y;
      }
      let h = 0, a = 0, s = 0, i = 0;
      dates.forEach(date => {
        const day = attendanceData[date] || {};
        if (day.hadir?.includes(student)) h++;
        else if (day.alpha?.includes(student)) a++;
        else if (day.sakit?.includes(student)) s++;
        else if (day.izin?.includes(student)) i++;
      });
      const pct = dates.length > 0 ? Math.round((h / dates.length) * 100) : 0;
      const cells = [(idx + 1).toString(), student, h.toString(), a.toString(), s.toString(), i.toString(), dates.length.toString(), pct + '%'];
      cells.forEach((cell, ci) => {
        doc.text(cell, colX[ci], rowY, { width: (ci === 1 ? 160 : 40), align: 'left' });
      });
      rowY += rowHeight;
    });
    doc.end();
    await finishPromise;
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Absensi.pdf"');
    res.status(200).end(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};