// Download file berikut dan letakkan di netlify/functions/lib/
// 1. https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
// 2. https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
// 3. https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/dist/jspdf.plugin.autotable.js
// 4. https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js
//
// Setelah itu, edit index.html:
// Ganti semua baris script CDN menjadi:
// <script src="./netlify/functions/lib/xlsx.full.min.js"></script>
// <script src="./netlify/functions/lib/jspdf.umd.min.js"></script>
// <script src="./netlify/functions/lib/jspdf.plugin.autotable.js"></script>
// <script src="./netlify/functions/lib/html2pdf.bundle.min.js"></script>
//
// Hapus cache browser, refresh halaman, dan error Tracking Prevention akan hilang.
