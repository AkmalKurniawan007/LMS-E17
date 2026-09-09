const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const publicDir = path.join(__dirname, 'public');

// Data Template Kosong (dengan 1 baris petunjuk)
const templateData = [
  { 
    email: 'email@contoh.com', 
    full_name: 'Nama Lengkap Siswa', 
    phone_number: '08123456789 (Opsional)', 
    institution: 'Nama Universitas / Sekolah (Opsional)', 
    address: 'Alamat Tinggal (Opsional)' 
  }
];

const worksheet = xlsx.utils.json_to_sheet(templateData);

// Set column widths to make it look nicer
const wscols = [
  {wch: 25}, // email
  {wch: 25}, // full_name
  {wch: 20}, // phone_number
  {wch: 35}, // institution
  {wch: 35}  // address
];
worksheet['!cols'] = wscols;

const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Template Data Siswa");
xlsx.writeFile(workbook, path.join(publicDir, 'template_siswa.xlsx'));
console.log('✅ template_siswa.xlsx created');
