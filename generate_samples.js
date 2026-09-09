const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const publicDir = path.join(__dirname, 'public');

// Data Siswa A (untuk CSV)
const dataA = [
  { email: 'andi.csv1@e17.com', full_name: 'Andi CSV Satu', phone_number: '08111111111', institution: 'Universitas A', address: 'Jalan A No 1' },
  { email: 'budi.csv2@e17.com', full_name: 'Budi CSV Dua', phone_number: '08222222222', institution: 'Universitas B', address: 'Jalan B No 2' },
  { email: 'cindy.csv3@e17.com', full_name: 'Cindy CSV Tiga', phone_number: '08333333333', institution: 'Universitas C', address: 'Jalan C No 3' },
  { email: 'doni.csv4@e17.com', full_name: 'Doni CSV Empat', phone_number: '08444444444', institution: 'Universitas D', address: 'Jalan D No 4' },
  { email: 'eko.csv5@e17.com', full_name: 'Eko CSV Lima', phone_number: '08555555555', institution: 'Universitas E', address: 'Jalan E No 5' },
];

// Data Siswa B (untuk XLSX)
const dataB = [
  { email: 'fani.xls1@e17.com', full_name: 'Fani Excel Satu', phone_number: '08666666666', institution: 'Politeknik F', address: 'Jalan F No 1' },
  { email: 'gilang.xls2@e17.com', full_name: 'Gilang Excel Dua', phone_number: '08777777777', institution: 'Politeknik G', address: 'Jalan G No 2' },
  { email: 'hadi.xls3@e17.com', full_name: 'Hadi Excel Tiga', phone_number: '08888888888', institution: 'Politeknik H', address: 'Jalan H No 3' },
  { email: 'indah.xls4@e17.com', full_name: 'Indah Excel Empat', phone_number: '08999999999', institution: 'Politeknik I', address: 'Jalan I No 4' },
  { email: 'jojo.xls5@e17.com', full_name: 'Jojo Excel Lima', phone_number: '08101010101', institution: 'Politeknik J', address: 'Jalan J No 5' },
];

// 1. Generate CSV
const csvHeaders = 'email,full_name,phone_number,institution,address\n';
const csvRows = dataA.map(d => `${d.email},${d.full_name},${d.phone_number},${d.institution},${d.address}`).join('\n');
fs.writeFileSync(path.join(publicDir, 'data_siswa_a.csv'), csvHeaders + csvRows);
console.log('✅ data_siswa_a.csv created');

// 2. Generate XLSX
const worksheet = xlsx.utils.json_to_sheet(dataB);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Data Siswa");
xlsx.writeFile(workbook, path.join(publicDir, 'data_siswa_b.xlsx'));
console.log('✅ data_siswa_b.xlsx created');
