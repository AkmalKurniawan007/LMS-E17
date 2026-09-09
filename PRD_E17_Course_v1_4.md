# Product Requirements Document (PRD)
# E17 Course — Learning Management System untuk Pelatihan Bootcamp

| | |
|---|---|
| **Versi Dokumen** | 1.5 |
| **Tanggal** | 9 September 2026 |
| **Status** | Draft — untuk Review Stakeholder |
| **Disusun oleh** | Product Manager |
| **Klasifikasi** | Internal |

### Riwayat Revisi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 12 Agu 2026 | Draft awal PRD |
| 1.1 | 12 Agu 2026 | Menambahkan: FR bulk import siswa (CSV), FR reset password mandiri, revisi FR video materi (hosting eksternal), FR manual override absensi, manajemen status enrollment (drop-out/mengundurkan diri), FR ekspor data (CSV/Excel), serta Acceptance Criteria pada seluruh User Story. Penomoran FR diperbarui secara menyeluruh mengikuti penambahan ini. |
| 1.2 | 13 Agu 2026 | Menambahkan: konsep **Batch/Angkatan** agar satu program dapat dijalankan berulang dengan jadwal, mentor, dan siswa berbeda per batch — termasuk kemampuan menyesuaikan (mengganti/menambah/menghapus) materi per batch tanpa mengubah kurikulum baku program; penanganan **zona waktu** (WIB/WITA/WIT) untuk jadwal sesi dan token QR; serta bagian kepatuhan **UU PDP** (Pelindungan Data Pribadi). Penomoran FR diperbarui secara menyeluruh mengikuti penambahan ini. |
| 1.3 | 13 Agu 2026 | Menambahkan evaluasi kesesuaian tech stack pada Bagian 6.1 — mengonfirmasi Supabase sesuai untuk kebutuhan backend LMS ini, serta merinci komponen teknis pendukung di luar Supabase (framework frontend & hosting, library generate/scan QR, generator PDF sertifikat, email transaksional, connection pooling) yang tetap diperlukan agar arsitektur lengkap dan siap diimplementasikan. |
| 1.4 | 18 Agu 2026 | Menindaklanjuti hasil review celah fungsional & edge case: (1) FR-21 direvisi — presensi online via roll call manual mentor; (2) pengumpulan tugas siswa & feedback mentor (FR-31A, FR-31B); (3) resend activation email bulk import (FR-13A); (4) sertifikat Valid/Revoked (FR-39A); (5) unlock gating manual dispensasi (FR-26A); (6) syarat kuis "selesai dibaca/ditonton" (FR-24A); (7) format baku sertifikat; (8) kontras warna WCAG 2.1 AA; (9) indeks database pada token presensi. |
| **1.5** | **9 Sep 2026** | **Menindaklanjuti penyelarasan alur operasional sesi & presensi: (1) Mengganti seluruh mekanisme absensi QR Code menjadi tombol "Klik Absen" di dalam setiap sesi yang aktif saat kelas dimulai oleh mentor; (2) Menetapkan struktur baku setiap sesi wajib memuat 3 elemen: Slot Tempat Upload Materi, Slot Tempat Tugas/Kuis, dan Button Absensi Siswa; (3) Menegaskan kewenangan konten: materi dan tugas/kuis HANYA bisa di-upload/dikelola oleh Mentor (Admin hanya berhak melihat/read-only), namun Super Admin/sistem wajib menyediakan wadah/slot pengunggahan tersebut; (4) Pengisian materi dan tugas/kuis bersifat opsional per sesi bagi Mentor, namun Absensi Siswa WAJIB ada dan berjalan di setiap sesi; (5) Mentor dan Admin sama-sama berhak melihat rekapitulasi data absensi.** |

---

## 1. Ringkasan Eksekutif

**E17 Course** adalah platform Learning Management System (LMS) berbasis web yang dirancang khusus untuk menyelenggarakan pelatihan bootcamp berstandar nasional. Platform ini mengakomodasi model pembelajaran **hibrida** (online dan offline) dengan fokus pada terselenggaranya 6 program bootcamp, di mana masing-masing program terdiri dari 10 sesi pembelajaran terstruktur. Setiap program dirancang sebagai kurikulum baku yang dapat dijalankan berulang dalam bentuk **batch/angkatan** yang berbeda-beda — sehingga sistem dapat terus digunakan untuk periode pelatihan berikutnya, dengan jadwal, mentor, dan siswa baru, tanpa membangun ulang struktur kurikulum dari awal.

Setiap sesi pembelajaran (1 s.d. 10) memiliki struktur baku yang terdiri dari tiga komponen inti: (1) **Wadah/Slot Materi Pembelajaran**, (2) **Wadah/Slot Tugas dan Kuis**, serta (3) **Tombol (Button) Absensi Siswa**. Dari sisi tata kelola hak akses, pengunggahan materi dan pembuatan tugas/kuis merupakan wewenang eksklusif **Mentor** pengampu batch, sedangkan **Super Admin** hanya memiliki hak akses melihat (*read-only*). Pengisian materi dan tugas/kuis bersifat **opsional bagi mentor** di tiap sesi (dapat disesuaikan dengan kebutuhan sesi), namun elemen **Absensi Siswa bersifat WAJIB ada dan dijalankan pada setiap sesi**. Baik Mentor maupun Super Admin berhak penuh untuk memantau rekapitulasi absensi siswa.

Nilai jual utama (unique value proposition) E17 Course terletak pada tiga hal:

1. **Sistem absensi berbasis sesi aktif ("Klik Absen")** — Tombol presensi yang berada langsung di dalam halaman sesi dan aktif secara otomatis saat Mentor memulai kelas (*"Mulai Sesi"*), memudahkan siswa mencatat kehadiran tanpa hambatan teknis scan kamera, didukung fitur *manual override* oleh Mentor untuk menjamin validitas data kehadiran.
2. **Kuis tersemat (embedded quiz) dengan mekanisme gating** — siswa wajib menyelesaikan kuis di antara materi sebelum dapat melanjutkan ke sesi berikutnya, memastikan pemahaman bertahap.
3. **Output akhir yang terukur dan dapat diverifikasi publik** — kombinasi nilai otomatis (kuis) dan manual (mentor) yang bermuara pada sertifikat digital berstandar nasional dan halaman portofolio publik siswa yang dapat dibagikan sebagai bukti kompetensi (misalnya ke calon perekrut).

Platform dibangun di atas **Supabase** sebagai backend tunggal (PostgreSQL, Auth, dan Storage), memungkinkan pengembangan yang cepat, aman melalui Row Level Security (RLS), dan mudah diskalakan. Materi video secara khusus di-host pada platform eksternal (bukan Supabase Storage) untuk menghindari biaya bandwidth yang membengkak. Dari sisi desain, E17 Course mengusung identitas visual yang **modern dan hangat**, dengan warna utama Kuning Terang/Emas (`#FFD400`) dan aksen gradasi oranye pada elemen call-to-action, di atas latar terang untuk keterbacaan optimal.

Revisi 1.1–1.4 dari dokumen ini melengkapi operasional batch, zona waktu, UU PDP, bulk import, dan evaluasi tugas. **Revisi 1.5** menyempurnakan mekanisme presensi menjadi "Klik Absen" langsung di halaman sesi saat kelas dimulai, menetapkan 3 komponen baku per sesi, serta menegaskan batasan hak akses (materi & tugas hanya diunggah mentor, admin read-only, pengisian opsional bagi mentor, absensi wajib).

---

## 2. Tujuan & Ruang Lingkup

### 2.1 Latar Belakang

Penyelenggaraan bootcamp secara konvensional (absensi manual/kertas, materi tersebar di berbagai platform, penilaian tidak terpusat, sertifikat dibuat manual) menyulitkan operasional maupun validasi kualitas lulusan. E17 Course hadir untuk mengonsolidasikan seluruh siklus belajar-mengajar bootcamp — dari onboarding, kehadiran, materi, evaluasi, hingga bukti kelulusan — dalam satu sistem yang terstandardisasi.

### 2.2 Tujuan Bisnis

- Menstandardisasi proses penyelenggaraan bootcamp secara nasional agar kredibel dan dapat diaudit.
- Mengurangi beban administratif mentor dan admin (absensi manual, rekap nilai manual, pendaftaran satu per satu, reset password manual).
- Meningkatkan kredibilitas lulusan melalui sertifikat digital terverifikasi dan portofolio publik.
- Menyediakan data kehadiran dan performa siswa yang akurat, termasuk dapat diekspor, sebagai dasar pengambilan keputusan program.

### 2.3 Tujuan Produk

- Menyediakan satu platform terpadu untuk mengelola 6 program bootcamp, masing-masing dengan 10 sesi.
- Mendukung pembelajaran hibrida (kelas online dan offline) dalam satu alur pengalaman yang konsisten.
- Memastikan integritas data kehadiran melalui tombol **"Klik Absen"** yang aktif saat kelas dimulai oleh mentor, dengan jaring pengaman manual override saat terjadi kendala teknis.
- Menstandardisasi struktur setiap sesi dengan 3 komponen wajib: Slot Materi, Slot Tugas/Kuis, dan Button Absensi Siswa.
- Menjamin pemisahan wewenang konten: materi dan tugas/kuis hanya dapat diunggah oleh Mentor (opsional per sesi), sementara Super Admin bersifat *read-only*.
- Menggabungkan penilaian otomatis dan manual menjadi satu sistem grading yang transparan.
- Mengotomatiskan penerbitan sertifikat digital dan publikasi portofolio begitu siswa dinyatakan lulus.
- Mendukung operasional skala nasional: onboarding massal siswa, siklus status enrollment yang realistis (termasuk drop-out), dan pelaporan yang dapat diekspor.
- **Memungkinkan setiap program dijalankan berulang melalui konsep batch/angkatan, lengkap dengan kemampuan menyesuaikan materi per batch, sehingga platform tetap relevan digunakan untuk periode-periode pelatihan berikutnya tanpa membangun ulang kurikulum dari nol.**

### 2.4 Ruang Lingkup (In Scope)

| Area | Cakupan |
|---|---|
| Manajemen Program | CRUD 6 program bootcamp (kurikulum baku), masing-masing 10 sesi dengan struktur 3 komponen baku, oleh Super Admin |
| **Manajemen Batch/Angkatan** | **Pembuatan batch baru dari program yang ada, penjadwalan sesi dan zona waktu per batch, penyesuaian materi/tugas per batch oleh mentor, isolasi data siswa/kehadiran/nilai antar-batch** |
| Onboarding & Manajemen Pengguna | Pendaftaran akun individual maupun bulk import (CSV) ke suatu batch, alur reset password mandiri, pengelolaan hak akses |
| **Materi Pembelajaran** | **Wadah materi wajib tersedia di setiap sesi; pengunggahan dokumen/slide/gambar ke Supabase Storage dan penyematan embed video eksternal HANYA dapat dilakukan oleh Mentor (bersifat opsional per sesi); Super Admin hanya memiliki hak melihat (read-only)** |
| **Tugas & Kuis** | **Wadah tugas & kuis wajib tersedia di setiap sesi; pembuatan tugas/kuis HANYA dapat dilakukan oleh Mentor (bersifat opsional per sesi); Super Admin hanya memiliki hak melihat (read-only)** |
| **Absensi Siswa** | **Tombol "Klik Absen" di dalam setiap sesi yang aktif saat kelas dimulai oleh Mentor (WAJIB ada dan berjalan di setiap sesi); dilengkapi manual override oleh Mentor; rekapitulasi data absensi berhak dilihat oleh Mentor dan Super Admin** |
| Penilaian | Kalkulasi otomatis nilai kuis + input nilai manual mentor untuk tugas/proyek, rekap nilai akhir |
| Status Enrollment | Pengelolaan status siswa: Aktif, Lulus, Tidak Lulus, Mengundurkan Diri |
| Sertifikasi | Generator sertifikat digital otomatis saat siswa dinyatakan lulus |
| Portofolio | Halaman portofolio publik yang terhubung dengan sertifikat dan pencapaian siswa |
| Pelaporan | Ekspor data kehadiran, nilai, dan status kelulusan ke CSV/Excel oleh Super Admin dan Mentor |

### 2.5 Di Luar Ruang Lingkup (Out of Scope — Fase Awal)

- Aplikasi mobile native (iOS/Android) — versi awal berfokus pada web responsif.
- Pembayaran/payment gateway untuk pendaftaran bootcamp berbayar.
- Hosting/streaming video native di dalam platform — video wajib menggunakan platform eksternal (lihat FR-23).
- Fitur live streaming/video conference bawaan (integrasi pihak ketiga seperti Zoom/Google Meet dapat dipertimbangkan di fase lanjutan, bukan dibangun native).
- Forum diskusi/komunitas antar-siswa (dapat menjadi fase 2).
- Multi-bahasa (versi awal berbahasa Indonesia).
- Penjadwalan batch otomatis (misal auto-generate batch baru berdasarkan kalender) — pembuatan batch bersifat manual oleh Super Admin pada fase awal.

### 2.6 Target Pengguna

- Penyelenggara/lembaga bootcamp yang membutuhkan sistem manajemen pelatihan terstandardisasi.
- Mentor/instruktur bootcamp di berbagai bidang keahlian.
- Peserta/siswa bootcamp yang ingin mendapatkan sertifikasi dan portofolio yang kredibel.

---

## 3. Aktor Pengguna (User Roles)

| Role | Deskripsi | Hak Akses Utama |
|---|---|---|
| **Super Admin** | Mengelola keseluruhan sistem | Kelola 6 program (kurikulum baku) & batch/angkatan per program, memastikan struktur sesi (slot materi, slot tugas/kuis, button absensi) tersedia, kelola akun & hak akses mentor per batch, bulk import siswa ke batch, kelola status enrollment, **melihat (read-only) materi & tugas/kuis per batch**, **melihat rekap absensi seluruh siswa**, ekspor data lintas program/batch, kelola template sertifikat |
| **Mentor** | Mengajar dan menilai siswa dalam batch yang diampu | **Mengunggah materi dan tugas/kuis pada sesi batch yang diampu (opsional per sesi, wewenang eksklusif mentor)**, **memulai sesi kelas untuk mengaktifkan tombol "Klik Absen" siswa**, melakukan manual override absensi jika diperlukan, **melihat rekap absensi batch yang diampu**, memeriksa tugas dan memberikan feedback/nilai manual, mengekspor rekap batch yang diampu |
| **User (Siswa)** | Peserta bootcamp | Akses materi sesuai progres (jika diunggah mentor), kerjakan kuis/tugas (jika tersedia), **menekan tombol "Klik Absen" saat sesi kelas dimulai oleh mentor (wajib di setiap sesi)**, lihat nilai & progres, unduh sertifikat, kelola halaman portofolio publik |

Catatan desain sistem: hak akses dikontrol melalui **Supabase Auth** dengan atribut role, dan ditegakkan di level database melalui **Row Level Security (RLS)** — bukan hanya di sisi UI — agar tidak ada celah akses lintas-role, lintas-program, maupun lintas-batch.

---

## 4. User Stories & Acceptance Criteria

### 4.1 Super Admin

**US-A1 — Kelola Program & Sesi**
Sebagai Super Admin, saya ingin membuat dan mengelola 6 program bootcamp sebagai kurikulum baku beserta 10 sesi masing-masing, sehingga struktur kurikulum konsisten, terpusat, dan dapat dipakai berulang lintas batch.
*Acceptance Criteria:*
- Super Admin dapat membuat, mengubah, dan menonaktifkan program beserta metadatanya (nama, deskripsi, struktur 10 sesi baku).
- Sistem menolak pembuatan sesi ke-11 pada satu program (validasi batas 10 sesi) atau menampilkan peringatan sesuai kebijakan yang disepakati.
- Perubahan struktur program tercatat dengan riwayat (siapa mengubah, kapan).

**US-A9 — Kelola Batch/Angkatan Program**
Sebagai Super Admin, saya ingin membuat batch/angkatan baru dari salah satu program yang sudah ada, sehingga program dapat dijalankan ulang untuk kelompok siswa berikutnya tanpa membangun ulang kurikulum dari nol.
*Acceptance Criteria:*
- Super Admin dapat membuat batch baru (misal "Web Development — Batch 3") dari salah satu program acuan; sistem menyalin struktur 10 sesi baku program tersebut sebagai baseline batch baru.
- Saat membuat batch, Super Admin menetapkan jadwal (tanggal per sesi), zona waktu (WIB/WITA/WIT), dan mentor pengampu khusus batch tersebut.
- Super Admin dan/atau Mentor dapat menyesuaikan sesi pada suatu batch — mengganti, menambah, atau menghapus materi/kuis — tanpa memengaruhi program acuan maupun batch lain yang sedang atau sudah berjalan.
- Data siswa, kehadiran, nilai, dan sertifikat pada suatu batch terisolasi penuh dari batch lain, meskipun berasal dari program yang sama.
- Dua batch dari program yang sama dapat berjalan aktif bersamaan (paralel) pada periode yang tumpang tindih.
- Super Admin dapat melihat daftar seluruh batch (status: akan datang, berjalan, selesai) dari setiap program.

**US-A2 — Kelola Akun & Akses Mentor**
Sebagai Super Admin, saya ingin membuat akun mentor dan menetapkan batch yang diampunya, sehingga hak akses mentor sesuai tanggung jawabnya.
*Acceptance Criteria:*
- Super Admin dapat membuat akun mentor baru dan menautkannya ke satu atau lebih batch.
- Mentor yang login hanya dapat melihat/mengelola data batch yang ditautkan padanya (divalidasi oleh RLS).
- Super Admin dapat mencabut penautan mentor dari suatu batch tanpa menghapus riwayat aktivitasnya.

**US-A6 — Bulk Import Siswa via CSV**
Sebagai Super Admin, saya ingin mengunggah daftar siswa dalam satu file CSV beserta penempatan batchnya, sehingga saya tidak perlu mendaftarkan siswa satu per satu untuk skala bootcamp nasional.
*Acceptance Criteria:*
- Sistem menyediakan template CSV yang dapat diunduh, dengan kolom minimal: nama lengkap, email, dan kode batch tujuan.
- Setelah file diunggah, sistem menampilkan pratinjau hasil validasi per baris (valid/gagal) sebelum diproses secara final — termasuk alasan gagal (misal email duplikat, format salah, kode batch tidak ditemukan).
- Baris yang valid diproses menjadi akun + enrollment ke batch terkait; baris yang gagal tidak menghentikan proses baris lain (partial success diperbolehkan).
- Siswa yang berhasil diimpor menerima notifikasi/undangan untuk mengaktifkan akun (set password awal).

**US-A7 — Kelola Status Enrollment Siswa**
Sebagai Super Admin, saya ingin mengubah status enrollment siswa (misalnya menjadi "Mengundurkan Diri"), sehingga data sistem mencerminkan kondisi riil di lapangan.
*Acceptance Criteria:*
- Super Admin dapat mengubah status enrollment siswa dari daftar: Aktif, Lulus, Tidak Lulus, Mengundurkan Diri.
- Perubahan status wajib disertai keterangan/alasan singkat (dicatat untuk audit).
- Riwayat nilai dan kehadiran siswa tetap tersimpan dan dapat dilihat meskipun statusnya berubah.

**US-A8 — Ekspor Rekap Data**
Sebagai Super Admin, saya ingin mengekspor rekap kehadiran, nilai, dan status kelulusan ke CSV/Excel, sehingga saya dapat melakukan pelaporan administratif ke pihak lembaga/mitra.
*Acceptance Criteria:*
- Super Admin dapat memilih cakupan ekspor (per batch, per program, per sesi, atau seluruh program) dan rentang tanggal.
- File hasil ekspor tersedia dalam format CSV dan/atau XLSX dan dapat diunduh langsung dari browser.
- Kolom ekspor minimal mencakup: nama siswa, program, batch, persentase kehadiran, nilai akhir, dan status kelulusan/enrollment.

**US-A3 — Monitoring Lintas Program**
Sebagai Super Admin, saya ingin memonitor rekap kehadiran, nilai, dan kelulusan seluruh siswa lintas program dan batch, sehingga saya dapat mengevaluasi kualitas penyelenggaraan.
*Acceptance Criteria:*
- Dashboard menampilkan ringkasan agregat (jumlah siswa aktif, tingkat kelulusan, rata-rata kehadiran) per program, per batch, dan lintas program.
- Data pada dashboard dapat difilter berdasarkan program, batch, dan rentang waktu.

**US-A4 — Template Sertifikat Nasional**
Sebagai Super Admin, saya ingin mengatur template sertifikat digital berstandar nasional, sehingga seluruh sertifikat yang terbit konsisten dan sah secara format.
*Acceptance Criteria:*
- Super Admin dapat mengunggah/mengatur elemen template sertifikat (logo, format nomor seri, tanda tangan digital).
- Perubahan template hanya berlaku untuk sertifikat yang diterbitkan setelah perubahan (sertifikat lama tidak berubah retroaktif).

**US-A5 — Cabut Akses Mentor**
Sebagai Super Admin, saya ingin menonaktifkan/mencabut akses mentor tertentu, sehingga keamanan sistem tetap terjaga saat terjadi perubahan staf pengajar.
*Acceptance Criteria:*
- Mentor yang dinonaktifkan langsung kehilangan akses login pada percobaan login berikutnya.
- Data materi/kuis yang pernah dibuat mentor tersebut tetap tersedia bagi batch terkait.

### 4.2 Mentor

**US-M1 — Unggah Materi (Wewenang Khusus Mentor, Opsional per Sesi)**
Sebagai Mentor, saya ingin mengunggah materi pembelajaran (dokumen/slide/gambar atau embed video) pada sesi batch yang saya ampu, di mana pengisian ini bersifat opsional sesuai kebutuhan sesi pembelajaran.
*Acceptance Criteria:*
- Mentor memiliki hak eksklusif untuk mengunggah file PDF, slide, dan gambar ke Supabase Storage untuk sesi tertentu pada batch yang diampunya (Super Admin hanya dapat melihat/read-only).
- Untuk materi video, mentor menyisipkan tautan/embed code dari platform eksternal (YouTube Unlisted/Private atau Vimeo) — sistem menolak upload file video langsung.
- Pengunggahan materi bersifat opsional bagi mentor di setiap sesi (sesi tetap sah berjalan meskipun tidak ada materi baru yang diunggah).
- Materi yang diunggah langsung terhubung ke sesi terkait dan dapat diakses oleh siswa pada batch yang sama.

**US-M2 — Buat Kuis & Penugasan (Wewenang Khusus Mentor, Opsional per Sesi)**
Sebagai Mentor, saya ingin membuat tugas atau kuis yang disisipkan pada sesi pembelajaran, di mana pengisian ini bersifat opsional sesuai rancangan pembelajaran saya.
*Acceptance Criteria:*
- Mentor memiliki hak eksklusif untuk membuat kuis (pilihan ganda, benar/salah) atau penugasan pada sesi batch yang diampunya (Super Admin hanya dapat melihat/read-only).
- Pengisian kuis/tugas bersifat opsional bagi mentor per sesi (bisa dikosongkan bila sesi hanya berfokus pada materi atau diskusi).
- Mentor dapat menetapkan passing grade, batas waktu pengumpulan (deadline), dan jumlah percobaan (retry) yang diizinkan per kuis/tugas.

**US-M3 — Memulai Sesi & Mengaktifkan Tombol "Klik Absen" Siswa**
Sebagai Mentor, saya ingin menekan tombol "Mulai Sesi / Mulai Kelas" saat sesi pembelajaran dimulai, sehingga tombol "Klik Absen" otomatis aktif bagi siswa terdaftar di halaman sesi tersebut.
*Acceptance Criteria:*
- Mentor dapat membuka sesi kelas yang dijadwalkan dan menekan tombol "Mulai Sesi" (mengubah status sesi menjadi "Sedang Berjalan").
- Saat status sesi berubah menjadi "Sedang Berjalan", tombol "Klik Absen" di halaman siswa pada batch tersebut otomatis aktif dan dapat diklik.
- Ketika sesi ditutup/diakhiri oleh Mentor ("Selesai"), tombol "Klik Absen" otomatis terkunci/nonaktif untuk mencegah absensi susulan tanpa izin.

**US-M7 — Manual Override Absensi**
Sebagai Mentor, saya ingin mencatat atau mengubah status kehadiran siswa secara manual dari roster sesi, sehingga siswa yang mengalami kendala perangkat/jaringan tetap dapat tercatat hadir dengan sah.
*Acceptance Criteria:*
- Mentor dapat membuka daftar roster peserta sesi dan mengubah status kehadiran siswa secara manual (Hadir, Izin, Sakit, Alpha).
- Entri kehadiran hasil manual override ditandai tersendiri (untuk audit), namun tetap dihitung sebagai kehadiran sah pada rekapitulasi persentase kehadiran siswa.
- Aksi manual override tercatat beserta identitas mentor yang melakukannya dan timestamp pencatatan.

**US-M4 — Lihat Kehadiran Siswa Real-time**
Sebagai Mentor (dan Super Admin), saya ingin melihat daftar absensi siswa secara real-time saat sesi berjalan, sehingga saya mengetahui siapa saja yang sudah menekan tombol "Klik Absen".
*Acceptance Criteria:*
- Tampilan daftar kehadiran siswa ter-update secara real-time begitu siswa menekan tombol "Klik Absen".
- Mentor dan Super Admin dapat memantau ringkasan kehadiran (jumlah hadir, izin, sakit, belum absen) secara langsung di halaman sesi.

**US-M9 — Periksa Tugas & Beri Feedback**
Sebagai Mentor, saya ingin memeriksa tugas/proyek yang dikumpulkan siswa dan memberikan catatan umpan balik, sehingga siswa mendapat masukan yang jelas selain nilai angka.
*Acceptance Criteria:*
- Mentor dapat melihat daftar pengumpulan tugas per siswa pada batch yang diampu, beserta file/tautan yang dikumpulkan.
- Mentor dapat menuliskan catatan/feedback per pengumpulan, terlihat oleh siswa yang bersangkutan.

**US-M5 — Input Nilai Manual**
Sebagai Mentor, saya ingin memberikan nilai manual (misalnya untuk tugas praktik/proyek), sehingga penilaian tidak hanya bergantung pada kuis otomatis.
*Acceptance Criteria:*
- Mentor dapat menginput/mengubah nilai manual per siswa per komponen penilaian sebelum status kelulusan difinalisasi.
- Perubahan nilai manual tercatat dengan riwayat (audit log).

**US-M6 — Rekap Nilai Gabungan**
Sebagai Mentor, saya ingin melihat rekap nilai gabungan (otomatis + manual) per siswa, sehingga saya dapat menentukan kelulusan dengan basis data yang jelas.
*Acceptance Criteria:*
- Rekap menampilkan breakdown nilai kuis otomatis, nilai manual, dan nilai akhir terhitung per siswa dalam satu tampilan.
- Mentor (dan Super Admin) dapat mengekspor rekap ini ke CSV/Excel untuk batch yang diampu.

### 4.3 User (Siswa)

**US-S1 — Akses Materi Sekuensial**
Sebagai Siswa, saya ingin mengakses materi sesuai urutan sesi yang diunggah mentor, sehingga saya belajar secara terstruktur.
*Acceptance Criteria:*
- Siswa dapat melihat materi pembelajaran yang diunggah oleh mentor pada sesi berjalan.
- Siswa tidak dapat membuka materi sesi berikutnya sebelum menyelesaikan syarat pada sesi berjalan (materi dibaca + kuis lulus, bila ada kuis).

**US-S2 — Kerjakan Kuis & Tugas**
Sebagai Siswa, saya ingin mengerjakan kuis atau mengumpulkan tugas yang disediakan mentor di dalam sesi menggunakan HP atau laptop saya.
*Acceptance Criteria:*
- Siswa dapat mengerjakan kuis dari perangkat mobile maupun desktop dan langsung melihat skor setelah submit.
- Jika nilai di bawah passing grade dan retry masih tersedia, siswa dapat mengulang sesuai batas yang ditetapkan mentor.

**US-S3 — Klik Absen saat Sesi Dimulai (Wajib di Setiap Sesi)**
Sebagai Siswa, saya ingin menekan tombol "Klik Absen" di dalam halaman sesi begitu kelas dimulai oleh mentor, sehingga kehadiran saya tercatat secara instan tanpa perlu memindai QR code.
*Acceptance Criteria:*
- Tombol "Klik Absen" tampil jelas di dalam halaman sesi pembelajaran siswa.
- Tombol hanya dapat diklik saat sesi telah dimulai oleh Mentor (status sesi "Sedang Berjalan").
- Siswa menerima konfirmasi visual instan (status berubah menjadi "Hadir" dengan badge hijau dan timestamp) setelah tombol berhasil ditekan.
- Sistem mencegah penekanan tombol ganda (single submission) untuk sesi yang sama.
- Jika sesi belum dimulai atau sudah ditutup oleh mentor, tombol berada dalam status nonaktif (*disabled*) dengan keterangan yang jelas.

**US-S4 — Lihat Nilai & Progres**
Sebagai Siswa, saya ingin melihat nilai dan progres belajar saya kapan saja, sehingga saya tahu posisi saya dalam program.
*Acceptance Criteria:*
- Dashboard siswa menampilkan progres sesi, riwayat nilai kuis, nilai manual, dan persentase kehadiran secara real-time.

**US-S5 — Unduh Sertifikat**
Sebagai Siswa, saya ingin mengunduh sertifikat digital begitu saya dinyatakan lulus, sehingga saya memiliki bukti kompetensi resmi.
*Acceptance Criteria:*
- Tombol unduh sertifikat muncul otomatis begitu status siswa menjadi "Lulus".
- Sertifikat berformat PDF dan memuat nomor seri unik serta kode verifikasi.

**US-S6 — Halaman Portofolio Publik**
Sebagai Siswa, saya ingin memiliki halaman portofolio publik yang menampilkan sertifikat dan pencapaian saya, sehingga saya dapat membagikannya ke calon perekrut.
*Acceptance Criteria:*
- Setiap siswa memiliki URL portofolio unik yang dapat diakses tanpa login oleh pihak luar.
- Siswa dapat memilih sertifikat/pencapaian mana saja yang ditampilkan pada halaman publiknya.

**US-S7 — Kumpulkan Tugas/Proyek**
Sebagai Siswa, saya ingin mengumpulkan tugas atau proyek melalui unggah file atau tautan eksternal, sehingga hasil kerja saya dapat dinilai oleh mentor.
*Acceptance Criteria:*
- Siswa dapat mengunggah file tugas (PDF/ZIP) ke Supabase Storage, atau menyematkan tautan eksternal (GitHub, Figma, Google Drive, Google Docs) sebagai alternatif unggah file.
- Siswa dapat melihat status pengumpulannya (terkumpul/belum) beserta feedback yang diberikan mentor, jika sudah diberikan.

### 4.4 Lintas Peran (Berlaku untuk Semua Role)

**US-G1 — Reset Password Mandiri**
Sebagai Pengguna (Super Admin/Mentor/Siswa), saya ingin dapat mereset password saya sendiri melalui email jika lupa, sehingga saya tidak perlu bergantung pada Super Admin untuk masalah akses akun.
*Acceptance Criteria:*
- Halaman login menyediakan tautan "Lupa Password" yang mengirimkan email berisi tautan reset ke alamat terdaftar.
- Tautan reset memiliki masa berlaku terbatas (misal 30–60 menit) dan hanya dapat digunakan satu kali.
- Setelah password berhasil direset, seluruh sesi login aktif sebelumnya pada akun tersebut otomatis berakhir (di-invalidate) demi keamanan.

---

## 5. Persyaratan Fungsional (Functional Requirements)

Prioritas: **M** = Must Have, **S** = Should Have, **C** = Could Have

### 5.1 Manajemen Program & Batch/Angkatan

| ID | Requirement | Role | Prioritas |
|---|---|---|---|
| FR-01 | Sistem harus mendukung pengelolaan tepat 6 program bootcamp (kurikulum baku) yang dapat diberi nama, deskripsi, dan struktur 10 sesi standar. | Super Admin | M |
| FR-02 | Setiap program terdiri dari 10 sesi pembelajaran baku yang tersusun berurutan (sequential), digunakan sebagai template/acuan saat membuat batch baru. | Super Admin | M |
| **FR-03** | **Super Admin dapat membuat satu atau lebih batch/angkatan dari suatu program, masing-masing dengan jadwal (tanggal per sesi), zona waktu (WIB/WITA/WIT), dan mentor pengampu sendiri.** | Super Admin | M |
| **FR-04** | **Saat batch dibuat, sistem menyalin struktur 10 sesi baku dari program acuan sebagai baseline, di mana setiap sesi otomatis memiliki 3 wadah/slot: Slot Materi, Slot Tugas/Kuis, dan Button Absensi. Mentor pengampu selanjutnya dapat menyesuaikan (mengunggah/menghapus) materi dan tugas/kuis pada batch tersebut (bersifat opsional per sesi), sementara Super Admin hanya memiliki hak melihat (read-only).** | Mentor / Super Admin | M |
| **FR-05** | **Data siswa (enrollment), kehadiran, nilai, kuis, dan sertifikat harus terisolasi per batch — data satu batch tidak tercampur dengan batch lain meskipun berasal dari program yang sama.** | Sistem | M |
| **FR-06** | **Dua batch atau lebih dari program yang sama dapat berjalan aktif secara bersamaan (paralel) pada periode yang tumpang tindih.** | Sistem | S |
| **FR-07** | **Setiap sesi dapat ditandai sebagai online atau offline (disertai link pertemuan Zoom/Meet atau lokasi ruang kelas). Baik sesi online maupun offline menerapkan alur presensi yang seragam: tombol "Klik Absen" aktif saat kelas dimulai oleh mentor, didukung jaring pengaman manual override.** | Super Admin / Mentor | M |
| FR-08 | Super Admin dapat menetapkan satu atau lebih mentor pengampu per batch. | Super Admin | M |

### 5.2 Onboarding & Manajemen Pengguna

| ID | Requirement | Role | Prioritas |
|---|---|---|---|
| FR-09 | Registrasi dan autentikasi pengguna menggunakan Supabase Auth (email/password, dengan opsi verifikasi email). | Sistem | M |
| FR-10 | Sistem harus menerapkan 3 level role (Super Admin, Mentor, Siswa) dengan hak akses berbeda, ditegakkan melalui RLS di level database. | Sistem | M |
| FR-11 | Super Admin dapat membuat, mengedit, menonaktifkan akun Mentor beserta batch yang diampunya. | Super Admin | M |
| FR-12 | Siswa dapat mendaftar/didaftarkan ke satu atau lebih batch bootcamp secara individual. | Super Admin / Siswa | M |
| FR-13 | Super Admin dapat melakukan bulk import akun siswa beserta penempatan batchnya melalui file CSV, dengan pratinjau validasi (baris sukses/gagal beserta alasan) sebelum diproses final. Baris gagal tidak menghalangi pemrosesan baris valid lainnya. | Super Admin | M |
| **FR-13A** | **Super Admin dapat mengirim ulang ("Resend Activation Email") tautan aktivasi akun bagi siswa hasil bulk import yang belum melakukan aktivasi awal (misal karena tautan sebelumnya kedaluwarsa atau email tidak terbaca), langsung dari dashboard Super Admin, tanpa perlu mengulang proses bulk import.** | **Super Admin** | **S** |
| FR-14 | Sistem menyediakan alur "Lupa Password" mandiri (self-service) berbasis tautan reset via email, dengan masa berlaku tautan terbatas dan berlaku untuk seluruh role, tanpa memerlukan intervensi manual Super Admin. | Sistem | M |

### 5.3 Sistem Absensi Sesi Aktif ("Klik Absen") & Roster Kehadiran

| ID | Requirement | Role | Prioritas |
|---|---|---|---|
| **FR-15** | **Mentor dapat memulai sesi kelas dengan menekan tombol "Mulai Sesi / Mulai Kelas" pada sesi terjadwal, yang mengubah status sesi menjadi "Sedang Berjalan" (Ongoing) dan secara otomatis mengaktifkan tombol "Klik Absen" bagi seluruh siswa terdaftar pada batch tersebut.** | **Mentor** | **M** |
| **FR-16** | **Tombol "Klik Absen" hanya aktif dan dapat diklik oleh siswa selama sesi berstatus "Sedang Berjalan". Sebelum sesi dimulai ("Belum Mulai") atau setelah sesi ditutup ("Selesai") oleh Mentor, tombol absensi siswa berada dalam status non-aktif (disabled) untuk mencegah presensi di luar waktu kelas.** | **Sistem** | **M** |
| **FR-17** | **Siswa mencatat kehadirannya secara mandiri dengan menekan tombol "Klik Absen" langsung di halaman sesi pembelajaran (tanpa memerlukan scan QR). Begitu ditekan, sistem langsung mengubah status kehadiran siswa menjadi "Hadir" dan menampilkan konfirmasi visual.** | **Siswa** | **M** |
| FR-18 | Sistem mencatat timestamp presensi (UTC, ditampilkan sesuai zona waktu batch) dan menautkannya ke akun siswa serta sesi yang bersangkutan. | Sistem | M |
| **FR-19** | **Manual Override Absensi — Mentor memiliki hak wewenang mencatat atau mengubah kehadiran siswa secara manual (Hadir, Izin, Sakit, Alpha) dari roster peserta sesi apabila siswa mengalami kendala jaringan/perangkat atau memiliki izin resmi. Entri manual ditandai khusus untuk keperluan audit, namun tetap dihitung sah pada rekap kehadiran.** | **Mentor** | **M** |
| **FR-20** | **Monitoring Kehadiran Real-time — Mentor dan Super Admin sama-sama berhak melihat daftar kehadiran siswa secara real-time saat sesi berlangsung (live update), termasuk rekapitulasi jumlah siswa yang sudah dan belum melakukan absensi.** | **Mentor / Super Admin** | **M** |
| **FR-21** | **Struktur Baku Komponen Sesi — Setiap sesi (sesi 1 s.d. 10) wajib menyediakan 3 komponen terstruktur: (1) Wadah/Slot Materi Pembelajaran, (2) Wadah/Slot Tugas dan Kuis, dan (3) Komponen Tombol Absensi Siswa.** | **Sistem / Super Admin** | **M** |
| **FR-21A** | **Aturan Kewenangan & Pengisian Konten Sesi — Pengunggahan materi dan pembuatan tugas/kuis HANYA dapat dilakukan oleh Mentor pengampu batch; Super Admin hanya memiliki hak akses melihat (read-only). Pengisian materi dan tugas/kuis bersifat OPSIONAL per sesi bagi Mentor (dapat disesuaikan dengan kebutuhan materi), namun komponen Absensi Siswa bersifat WAJIB ada dan dijalankan pada setiap sesi.** | **Mentor / Super Admin** | **M** |
| FR-22 | Super Admin dan Mentor dapat melihat rekap kehadiran per siswa, per sesi, dan per batch, termasuk persentase kehadiran. | Super Admin / Mentor | M |

### 5.4 Materi Pembelajaran & Kuis Interaktif

| ID | Requirement | Role | Prioritas |
|---|---|---|---|
| FR-23 | Mentor memiliki hak eksklusif untuk mengunggah materi dalam format **PDF, slide, dan gambar** ke Supabase Storage, atau menyematkan tautan/embed video eksternal (YouTube/Vimeo). Pengunggahan ini bersifat **opsional per sesi** bagi mentor. Super Admin hanya memiliki hak melihat (*read-only*). Supabase Storage tidak digunakan untuk hosting/streaming video langsung. | Mentor | M |
| FR-24 | Siswa mengakses materi sesuai urutan sesi yang telah dibuka pada batch yang diikutinya (progres bersifat sekuensial). | Siswa | M |
| **FR-24A** | **Materi dianggap "selesai dibaca/ditonton" (syarat kuis dapat muncul) berdasarkan aksi eksplisit siswa: untuk materi dokumen/slide, siswa menekan tombol "Tandai Selesai & Lanjut ke Kuis"; untuk materi video embed, siswa menekan tombol "Selesai Menonton". Sistem tidak bergantung pada event otomatis dari platform video eksternal (misal `video_ended` YouTube), karena tidak selalu terkirim secara andal tanpa API khusus.** | **Siswa** | **M** |
| FR-25 | Mentor memiliki hak eksklusif untuk membuat kuis (pilihan ganda, isian singkat, atau benar/salah) atau tugas yang disisipkan di dalam sesi. Pembuatan kuis/tugas bersifat **opsional per sesi** bagi mentor. Super Admin hanya memiliki hak melihat (*read-only*). | Mentor | M |
| FR-26 | Siswa **wajib menyelesaikan kuis** yang muncul sebelum dapat mengakses materi/sesi berikutnya (mekanisme gating, jika kuis disediakan oleh mentor). | Sistem | M |
| **FR-26A** | **Mentor dapat membuka kunci (unlock) gating materi/sesi tertentu secara manual per siswa untuk kondisi khusus/dispensasi (misal siswa izin sakit sehingga belum mengerjakan kuis sesi sebelumnya, namun perlu mengikuti materi sesi berjalan). Aksi unlock tercatat dengan mentor pelaku, siswa terkait, dan alasan singkat untuk keperluan audit; kuis yang di-skip tetap dapat/perlu diselesaikan susulan sesuai kebijakan mentor.** | **Mentor** | **M** |
| FR-27 | Sistem menghitung skor kuis secara otomatis begitu siswa submit jawaban. | Sistem | M |
| FR-28 | Mentor dapat menentukan batas nilai minimum (passing grade) kuis dan jumlah percobaan ulang (retry) yang diizinkan. | Mentor | S |

> **Catatan rationale (FR-23):** meng-host dan melakukan streaming video langsung dari bucket storage biasa tanpa optimasi HLS/DASH berisiko memakan bandwidth sangat besar dan memicu biaya server membengkak. Supabase Storage dikhususkan untuk PDF, slide, gambar, dan file sertifikat PDF.

### 5.5 Manajemen Status Enrollment

| ID | Requirement | Role | Prioritas |
|---|---|---|---|
| FR-29 | Sistem menyediakan status enrollment siswa per batch: **Aktif, Lulus, Tidak Lulus, Mengundurkan Diri**. | Sistem | M |
| FR-30 | Super Admin (dan/atau Mentor sesuai kewenangan yang ditetapkan) dapat mengubah status enrollment siswa secara manual, disertai keterangan/alasan yang tercatat untuk audit. | Super Admin | M |
| FR-31 | Ketika status siswa berubah menjadi **"Mengundurkan Diri"** (atau status final non-aktif lain), sistem **otomatis menghentikan akses siswa ke materi/sesi berikutnya**, tanpa menghapus riwayat nilai dan kehadiran yang sudah ada. | Sistem | M |

### 5.6 Pengumpulan Tugas & Sistem Penilaian (Grading)

| ID | Requirement | Role | Prioritas |
|---|---|---|---|
| **FR-31A** | **Siswa dapat mengumpulkan tugas/proyek melalui salah satu dari dua cara: (a) mengunggah file (PDF/ZIP) ke Supabase Storage, atau (b) menyematkan tautan eksternal (GitHub repository, Figma, Google Drive, atau Google Docs). Setiap pengumpulan tercatat dengan timestamp dan ditautkan ke siswa serta komponen penilaian (tugas/proyek) yang bersangkutan.** | **Siswa** | **M** |
| **FR-31B** | **Mentor memiliki antarmuka untuk memeriksa hasil tugas yang dikumpulkan siswa (membuka file/tautan) dan memberikan catatan/umpan balik (feedback tertulis) di samping nilai angka, sebelum atau bersamaan dengan penginputan nilai manual (FR-32).** | **Mentor** | **M** |
| FR-32 | Sistem mengombinasikan nilai otomatis dari kuis dengan nilai manual yang diinput mentor (misal untuk tugas/proyek/presentasi) menjadi nilai akhir per siswa. | Sistem / Mentor | M |
| FR-33 | Mentor dapat menetapkan bobot (weight) masing-masing komponen penilaian (misal kuis 40%, tugas 30%, proyek akhir 30%). | Mentor / Super Admin | S |
| FR-34 | Sistem menghitung status kelulusan otomatis berdasarkan kombinasi nilai akhir dan persentase kehadiran minimum, dan memperbarui status enrollment siswa (FR-29) menjadi Lulus/Tidak Lulus sesuai hasil. | Sistem | M |
| FR-35 | Siswa dapat melihat rincian nilai per komponen (kuis per sesi, nilai manual, nilai akhir) melalui dashboard pribadi. | Siswa | M |

### 5.7 Sertifikat Digital & Portofolio Publik

| ID | Requirement | Role | Prioritas |
|---|---|---|---|
| FR-36 | Sistem secara otomatis men-generate sertifikat digital begitu status siswa berubah menjadi "Lulus". | Sistem | M |
| FR-37 | Sertifikat memuat elemen standar nasional: nama lengkap peserta, nama program, batch/angkatan, tanggal penyelenggaraan, nilai akhir, nomor sertifikat unik, tanda tangan digital/institusi, dan kode/QR verifikasi keaslian. | Sistem | M |
| FR-38 | Siswa dapat mengunduh sertifikat dalam format PDF melalui Supabase Storage. | Siswa | M |
| FR-39 | Sistem menyediakan halaman verifikasi publik (via nomor sertifikat atau QR) agar pihak ketiga (misal HRD) dapat memvalidasi keaslian sertifikat. Jika sertifikat berstatus **Revoked**, halaman menampilkan peringatan yang jelas bahwa sertifikat telah dicabut, alih-alih menampilkan status valid. | Sistem | S |
| **FR-39A** | **Setiap sertifikat memiliki status: Valid atau Revoked. Super Admin dapat mencabut (revoke) keabsahan sertifikat yang sudah terbit — misalnya karena kekeliruan data, kecurangan yang baru terbukti kemudian, atau pembatalan kelulusan — disertai alasan yang tercatat untuk audit. Sertifikat yang dicabut tetap tersimpan (tidak dihapus) untuk keperluan jejak audit, namun tidak lagi tervalidasi sebagai sah pada halaman verifikasi publik (FR-39).** | **Super Admin** | **M** |
| FR-40 | Setiap siswa memiliki halaman portofolio publik (URL unik) yang menampilkan profil, program & batch yang diselesaikan, sertifikat, dan nilai/pencapaian yang dipilih untuk ditampilkan. | Sistem / Siswa | M |
| FR-41 | Siswa dapat mengatur visibilitas item pada portofolionya (misal memilih menampilkan/menyembunyikan nilai detail). | Siswa | C |

> **Catatan format nomor sertifikat (FR-37):** untuk menjaga konsistensi dan memudahkan penelusuran, nomor sertifikat mengikuti format baku: `E17/[KODE_PROGRAM]/BATCH-[X]/[BULAN-ROMAWI]/[TAHUN]/[NOMOR_URUT]` — contoh: `E17/FSW/BATCH-01/VIII/2026/0042`. Nomor urut bersifat unik secara global (tidak reset per batch/bulan) untuk mencegah duplikasi.

### 5.8 Dashboard, Notifikasi & Ekspor Data

| ID | Requirement | Role | Prioritas |
|---|---|---|---|
| FR-42 | Setiap role memiliki dashboard sesuai kebutuhannya (Super Admin: ringkasan seluruh program & batch; Mentor: batch yang diampu; Siswa: progres belajar pribadi). | Sistem | M |
| FR-43 | Sistem mengirimkan notifikasi (in-app dan/atau email) untuk kejadian penting: sesi akan dimulai, sesi dimulai ("Klik Absen" aktif), kuis baru tersedia, nilai diperbarui, sertifikat terbit, hasil bulk import siswa. | Sistem | S |
| FR-44 | Super Admin dan Mentor dapat mengekspor rekap data (kehadiran, nilai kuis, nilai akhir, status kelulusan/enrollment) ke format CSV dan/atau Excel (.xlsx), dengan cakupan per sesi, per batch, per program (Mentor: terbatas pada batch yang diampu), atau lintas program (khusus Super Admin). | Super Admin / Mentor | M |

---

## 6. Persyaratan Non-Fungsional

### 6.1 Arsitektur Teknis

**Evaluasi Kesesuaian Stack:** Supabase sebagai backend tunggal **sesuai** untuk kebutuhan E17 Course pada skala yang dijelaskan di dokumen ini (6 program, banyak batch berjalan paralel, hingga ribuan siswa secara nasional). Kebutuhan intinya — data relasional terstruktur (program–batch–sesi–enrollment–nilai), autentikasi berbasis role dengan isolasi akses per batch, penyimpanan dokumen, dan update real-time untuk absensi — seluruhnya tercakup baik oleh PostgreSQL, Supabase Auth, Storage, dan Realtime, tanpa perlu menggabungkan banyak vendor backend berbeda. Kombinasi ini juga cocok untuk tim kecil karena memangkas overhead infrastruktur (tidak perlu mengelola server/database sendiri).

Perlu digarisbawahi: pernyataan "sepenuhnya di atas Supabase" merujuk pada **backend**, bukan keseluruhan stack aplikasi. Beberapa komponen teknis tetap memerlukan pilihan tersendiri di luar Supabase — dirinci pada tabel "Komponen Teknis Tambahan" di bagian bawah subbab ini — agar arsitektur benar-benar lengkap dan siap diimplementasikan tim engineering.

Seluruh backend E17 Course dibangun di atas Supabase, dengan pembagian tanggung jawab sebagai berikut:

| Komponen | Layanan Supabase | Fungsi |
|---|---|---|
| Database | **Supabase PostgreSQL** | Menyimpan seluruh data terstruktur: program, batch, sesi (dengan status: not_started, ongoing, completed), pengguna, enrollment & status, kehadiran, kuis, nilai, sertifikat |
| Autentikasi | **Supabase Auth** | Registrasi, login, reset password mandiri, manajemen sesi pengguna, dan penetapan role (Super Admin/Mentor/Siswa) |
| Penyimpanan File | **Supabase Storage** | Menyimpan materi PDF/slide/gambar, file tugas siswa (PDF/ZIP), template & file sertifikat PDF, dan aset foto profil. **Tidak** digunakan untuk hosting/streaming video — video disematkan via tautan/embed dari platform eksternal (YouTube Unlisted/Private, Vimeo) |
| Real-time | **Supabase Realtime** | Mendukung update kehadiran secara live saat tombol "Klik Absen" ditekan siswa atau saat status sesi diperbarui |

**Keamanan tingkat database:** Row Level Security (RLS) diterapkan pada seluruh tabel sensitif, memastikan Mentor hanya dapat mengakses dan mengelola data batch yang diampunya, Siswa hanya dapat mengakses data miliknya sendiri, dan Super Admin memiliki akses pantau global.

**Gambaran skema data (ringkas, diperbarui v1.5):**

`programs` (kurikulum baku, 6 program tetap) → `batches` (angkatan per program: nama batch, tanggal mulai/selesai, zona waktu, mentor pengampu) → `sessions` (instance milik batch, memuat kolom status: `not_started`/`ongoing`/`completed`, serta 3 slot terstruktur: materi, tugas/kuis, absensi) → `materials` (khusus diisi mentor; tipe: pdf/slide/gambar/video_embed_url), `quizzes` → `quiz_questions`
`users` (dengan role) → `enrollments` (relasi siswa–**batch**, dengan kolom **status**: aktif/lulus/tidak_lulus/mengundurkan_diri) → `attendances` (dengan kolom **source**: `button_click`/`manual_override`), `quiz_attempts`, `grades`
`assignment_submissions` (relasi siswa–sesi/komponen penilaian, tipe: file_upload/external_link, beserta `feedback_mentor`)
`session_unlocks` (log unlock gating manual per siswa: mentor pelaku, siswa terkait, sesi/kuis yang di-skip, alasan, timestamp)
`certificates` (relasi 1–1 ke `enrollments` yang lulus, dengan kolom **status**: valid/revoked dan `revoked_reason`) → `portfolios` (relasi ke `users`)
`bulk_import_jobs` (log proses import CSV: baris sukses/gagal, alasan gagal, batch tujuan, status aktivasi per baris untuk kebutuhan resend activation)

**Mekanisme Absensi Sesi Aktif ("Klik Absen"):**
1. Setiap sesi memiliki 3 status siklus hidup: `not_started` (Belum Mulai), `ongoing` (Sedang Berjalan), dan `completed` (Selesai).
2. Ketika waktu kelas tiba, Mentor menekan tombol **"Mulai Sesi / Mulai Kelas"** di halaman sesi, yang memperbarui status sesi menjadi `ongoing`.
3. Bagi seluruh siswa terdaftar pada batch tersebut, tombol **"Klik Absen"** yang berada di dalam halaman sesi secara otomatis terbuka dan dapat ditekan.
4. Saat siswa menekan tombol "Klik Absen", sistem memverifikasi bahwa status sesi masih `ongoing` dan siswa terdaftar aktif, lalu mencatat baris kehadiran ke tabel `attendances` dengan `source: 'button_click'` dan timestamp saat itu. Terdapat *unique constraint* pada `(session_id, user_id)` untuk mencegah penekanan ganda.
5. Sebagai jaring pengaman bila siswa terkendala perangkat atau koneksi, Mentor dapat melakukan **Manual Override** (FR-19) dari daftar peserta sesi, yang disimpan dengan `source: 'manual_override'` dan mencatat ID mentor pencatat.
6. Baik Mentor maupun Super Admin dapat memantau pergerakan data kehadiran secara real-time via Supabase Realtime tanpa me-refresh halaman.
7. Setelah sesi berakhir, Mentor menekan tombol **"Selesai Sesi"**, yang mengubah status menjadi `completed` dan secara otomatis mengunci tombol absensi siswa.

**Zona waktu:** Seluruh timestamp (jadwal sesi, tenggat kuis/tugas, log audit, timestamp presensi) disimpan dalam **UTC** di database. Setiap batch memiliki atribut zona waktu (WIB/WITA/WIT) yang ditetapkan Super Admin saat pembuatan batch, digunakan untuk menampilkan jadwal dan waktu presensi kepada mentor dan siswa sesuai lokasi penyelenggaraan batch tersebut.

**Komponen Teknis Tambahan (di Luar Supabase):**

| Kebutuhan | Mengapa Tidak Tercakup Native oleh Supabase | Rekomendasi |
|---|---|---|
| Frontend & hosting web | Supabase adalah backend-as-a-service, bukan framework/hosting frontend | Framework berbasis React (misal **Next.js**) dengan Tailwind CSS untuk styling, di-hosting di platform seperti Vercel/Netlify. Next.js dipilih karena memiliki SDK resmi (`supabase-js`) dan mendukung rendering responsif |
| Generate sertifikat PDF | Supabase tidak punya fitur render PDF bawaan | Supabase Edge Function (berbasis Deno) yang memanggil library pembuatan PDF (misal `pdf-lib`) atau layanan render eksternal; hasil PDF baru diunggah ke Supabase Storage |
| Email transaksional (notifikasi FR-43, undangan bulk import) | Email bawaan Supabase Auth dibatasi untuk alur autentikasi (verifikasi/reset password) dan memiliki rate limit rendah pada tingkat dasar — tidak dirancang untuk volume notifikasi produksi | Konfigurasi custom SMTP pada Supabase Auth, dan/atau layanan email transaksional terpisah (misal Resend/Postmark) yang dipanggil dari Edge Function untuk notifikasi non-auth |
| Koneksi database saat beban puncak nasional | Tingkat gratis/dasar Supabase memiliki batas koneksi bersamaan | Gunakan connection pooling (Supavisor, sudah tersedia bawaan Supabase) dan tingkatkan paket (Pro/Team) sesuai proyeksi jumlah batch & siswa aktif bersamaan |

### 6.2 Keamanan

- Autentikasi wajib untuk seluruh akses (tidak ada halaman materi/nilai/absensi yang dapat diakses tanpa login), kecuali halaman verifikasi sertifikat dan portofolio publik yang memang dirancang terbuka.
- Tombol "Klik Absen" dilindungi validasi backend: request ditolak jika status sesi bukan `ongoing` atau user bukan siswa terdaftar di batch tersebut.
- Tautan reset password bersifat sekali pakai (single-use) dan memiliki masa berlaku terbatas; seluruh sesi login aktif diputus otomatis setelah reset berhasil.
- Enkripsi data saat transit (HTTPS/TLS) dan saat tersimpan (mengikuti standar enkripsi bawaan Supabase).
- Audit log untuk aksi sensitif (perubahan nilai manual, manual override absensi, pembukaan dispensasi gating, perubahan status enrollment, penerbitan/pencabutan sertifikat, hasil bulk import).

### 6.3 Performa & Skalabilitas

- Waktu muat halaman materi dan dashboard ditargetkan di bawah 3 detik pada koneksi standar.
- Eksekusi tombol "Klik Absen" harus responsif (di bawah 1 detik) saat seluruh siswa dalam satu kelas menekan tombol secara hampir bersamaan saat kelas dimulai.
- Skema tabel `attendances` wajib menggunakan **indeks database pada kolom `session_id` dan `user_id`** dengan constraint `UNIQUE(session_id, user_id)` untuk mencegah *duplicate insert* dan menjaga latensi query tetap cepat.
- Proses bulk import CSV harus mampu menangani minimal beberapa ratus baris dalam satu kali unggah tanpa timeout, dengan pemrosesan asinkron bila diperlukan untuk file besar.
- Proses ekspor data (CSV/Excel) untuk rekap absensi dan nilai harus tetap responsif meskipun volume data bertambah seiring berjalannya waktu.

### 6.4 Panduan UI/UX

**Prinsip Desain:** modern dan hangat (*modern & warm*), dengan penekanan pada keterbacaan dan kejelasan aksi (terutama untuk tombol "Klik Absen" saat sesi aktif).

| Elemen | Spesifikasi |
|---|---|
| **Warna Utama (Primary)** | Kuning Terang/Emas — `#FFD400` |
| **Warna Sekunder/Aksen** | Gradasi Oranye — digunakan pada tombol CTA utama seperti "Klik Absen" dan "Mulai Kuis" untuk menonjolkan aksi utama |
| **Background** | Terang/putih, agar kontras teks tetap tinggi dan mudah dibaca |
| **Tipografi** | Sans-serif modern, mengutamakan keterbacaan pada desktop dan perangkat mobile |
| **Komponen CTA** | Tombol aksi utama (Mulai Sesi, Klik Absen, Mulai Kuis, Unduh Sertifikat, Ekspor Data) tampil menonjol dengan warna aksen oranye agar mudah dikenali dalam sekali pandang |

Catatan implementasi: kombinasi kuning terang sebagai warna dominan berisiko menurunkan kontras jika diterapkan langsung sebagai warna teks di atas latar putih — disarankan warna kuning/emas digunakan pada elemen non-teks (header, ikon, badge, highlight) sementara teks utama tetap menggunakan warna netral gelap agar keterbacaan terjaga.

**Spesifikasi kontras (WCAG 2.1 AA):** warna kuning emas (`#FFD400`) di atas latar putih memiliki rasio kontras yang rendah untuk teks. Teks pada tombol/elemen berlatar kuning atau oranye **wajib** menggunakan warna gelap pekat (`#1A1A1A`), bukan putih, agar memenuhi standar WCAG 2.1 AA (rasio kontras minimal **4.5:1** untuk teks normal).

### 6.5 Aksesibilitas & Kompatibilitas

- Desain **responsif mobile-first** untuk antarmuka siswa (khususnya penekanan tombol "Klik Absen", membaca materi, dan pengerjaan kuis), dengan tampilan desktop yang dioptimalkan untuk dashboard Mentor dan Super Admin (termasuk alur bulk import dan ekspor data).
- Kompatibel dengan browser modern (Chrome, Safari, Edge, Firefox versi terbaru) tanpa memerlukan izin kamera atau instalasi library scanner tambahan.
- Kontras warna dan ukuran elemen interaktif mengikuti prinsip keterbacaan dasar (WCAG AA sebagai acuan minimum).

### 6.6 Kepatuhan Standar Nasional

- Format dan elemen sertifikat digital mengacu pada kaidah sertifikat pelatihan yang berlaku secara nasional (identitas lembaga penyelenggara, nomor registrasi/seri sertifikat, kompetensi/program yang diselesaikan, tanda tangan pihak berwenang, dan kode verifikasi).
- Setiap sertifikat memiliki nomor unik yang dapat ditelusuri dan diverifikasi melalui halaman publik, mendukung akuntabilitas dan pengakuan pihak eksternal (calon pemberi kerja, mitra institusi).

### 6.7 Kepatuhan Perlindungan Data Pribadi (UU PDP)

- Pemrosesan data pribadi siswa dan mentor (nama, email, dan data terkait lainnya) pada E17 Course tunduk pada **UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)**.
- Sistem meminta persetujuan (consent) eksplisit dari siswa saat pendaftaran — baik individual maupun saat didaftarkan melalui bulk import oleh Super Admin atas nama lembaga — atas penggunaan datanya untuk keperluan administrasi bootcamp, penerbitan sertifikat, dan publikasi portofolio publik.
- Siswa berhak mengajukan permintaan akses, koreksi, atau penghapusan data pribadinya (*right to be forgotten*), kecuali untuk data yang wajib dipertahankan demi keabsahan sertifikat yang sudah diterbitkan dan dipublikasikan atas persetujuan siswa sebelumnya.
- Kebijakan retensi data: data siswa berstatus "Tidak Lulus" atau "Mengundurkan Diri" tetap disimpan untuk keperluan audit dan pelaporan selama periode yang ditetapkan lembaga penyelenggara, sebelum dapat dihapus atas permintaan yang sah.
- Bulk import CSV (FR-13) hanya mengumpulkan kolom data yang benar-benar diperlukan untuk operasional (prinsip minimalisasi data).
- Lembaga penyelenggara bootcamp bertindak sebagai pengendali data (*data controller*); platform E17 Course bertindak sebagai pemroses data (*data processor*) yang bertanggung jawab atas keamanan teknis penyimpanan data sesuai UU PDP.

---

## 7. Alur Pengguna Utama (Key User Flows)

**Alur Pembuatan Batch Baru (Super Admin):**
1. Super Admin memilih salah satu dari 6 program yang ada → menekan "Buat Batch Baru".
2. Sistem menyalin struktur 10 sesi baku dari program tersebut sebagai baseline batch, di mana setiap sesi otomatis memiliki 3 slot baku: Slot Materi, Slot Tugas/Kuis, dan Button Absensi.
3. Super Admin mengisi nama batch, jadwal tiap sesi, zona waktu (WIB/WITA/WIT), dan menautkan mentor pengampu.
4. Mentor pengampu batch selanjutnya dapat mengisi materi atau tugas/kuis pada sesi-sesi tersebut sesuai kebutuhan (opsional per sesi). Super Admin dapat melihat sesi dalam mode read-only.
5. Batch berstatus "akan datang" hingga tanggal mulai tiba, lalu berubah menjadi "berjalan".

**Alur Onboarding Massal (Super Admin):**
1. Super Admin mengunduh template CSV → mengisi data siswa (nama, email, batch tujuan).
2. Super Admin mengunggah file CSV → sistem menampilkan pratinjau validasi (baris valid/gagal).
3. Super Admin mengonfirmasi proses → akun & enrollment siswa yang valid dibuat ke batch terkait; siswa menerima email undangan aktivasi akun.

**Alur Absensi Sesi Aktif — "Klik Absen" (Mentor & Siswa):**
1. Saat jadwal kelas tiba, Mentor membuka detail sesi terkait di sistem → menekan tombol **"Mulai Sesi / Mulai Kelas"**.
2. Status sesi berubah menjadi **"Sedang Berjalan" (Ongoing)**. Perubahan status ini secara otomatis mengaktifkan tombol **"Klik Absen"** pada halaman siswa yang terdaftar di batch tersebut.
3. Siswa masuk ke halaman sesi pembelajaran di perangkatnya (HP/Laptop) → menekan tombol **"Klik Absen"**.
4. Sistem memvalidasi status sesi aktif dan mencatat kehadiran siswa secara instan ke database dengan timestamp UTC. Tombol siswa berubah status menjadi "Sudang Absen (Hadir)".
5. Jika ada siswa yang terkendala koneksi/perangkat atau memiliki izin resmi, Mentor membuka daftar roster peserta sesi dan melakukan **Manual Override** (menandai Hadir/Izin/Sakit/Alpha).
6. Mentor dan Super Admin melihat rekapitulasi kehadiran peserta ter-update secara real-time.
7. Setelah sesi pembelajaran berakhir, Mentor menekan tombol **"Selesai Sesi"** untuk mengakhiri kelas, yang secara otomatis mengunci tombol absensi siswa.

**Alur Materi & Kuis (Siswa):**
1. Siswa membuka sesi aktif → mengakses materi pembelajaran yang diunggah oleh mentor (jika ada materi yang diunggah).
2. Jika sesi tersebut dilengkapi kuis tersemat oleh mentor, kuis muncul setelah materi selesai dipelajari.
3. Siswa mengerjakan dan submit kuis → sistem menghitung skor otomatis.
4. Jika memenuhi passing grade, siswa dapat lanjut ke sesi berikutnya; jika tidak, siswa dapat mengulang sesuai kuota retry atau meminta dispensasi unlock gating manual dari mentor (FR-26A).

**Alur Kelulusan & Sertifikasi:**
1. Sistem menghitung nilai akhir (otomatis + manual) dan persentase kehadiran siswa di akhir program.
2. Jika memenuhi kriteria kelulusan, status enrollment siswa berubah menjadi "Lulus"; jika tidak, menjadi "Tidak Lulus".
3. Sistem otomatis men-generate sertifikat digital (untuk siswa Lulus) dan mempublikasikannya ke halaman portofolio siswa.
4. Siswa menerima notifikasi dan dapat mengunduh sertifikat serta membagikan tautan portofolionya.

**Alur Pengunduran Diri Siswa:**
1. Siswa mengajukan pengunduran diri (di luar sistem/melalui admin) → Super Admin mengubah status enrollment siswa menjadi "Mengundurkan Diri" beserta alasannya.
2. Sistem otomatis menghentikan akses siswa ke materi/sesi berikutnya.
3. Riwayat nilai dan kehadiran siswa hingga titik tersebut tetap tersimpan dan dapat dilihat/diekspor untuk pelaporan.

---

## 8. Kriteria Keberhasilan (Success Metrics)

| Kategori | Metrik | Target Indikatif |
|---|---|---|
| Adopsi Sistem | Persentase mentor yang aktif memulai sesi ("Mulai Sesi") untuk mengaktifkan tombol presensi siswa di setiap sesi | ≥ 95% sesi dimulai tepat waktu melalui sistem |
| Efisiensi Onboarding | Waktu rata-rata pendaftaran siswa dalam jumlah besar (bulk import) dibanding pendaftaran manual satu per satu | Pengurangan signifikan waktu onboarding per angkatan bootcamp |
| Kemandirian Pengguna | Persentase kasus lupa password yang terselesaikan mandiri tanpa intervensi Super Admin | ≥ 90% self-service melalui fitur reset password |
| Integritas Absensi | Tingkat keikutsertaan siswa menekan tombol "Klik Absen" saat sesi berlangsung, serta proporsi wajar antara entri mandiri vs manual override | Penurunan signifikan kecurangan; manual override hanya digunakan sebagai pengecualian (kendala teknis/izin), bukan mayoritas |
| Keterlibatan Belajar | Tingkat penyelesaian kuis tersemat dan tugas oleh siswa aktif | ≥ 90% kuis/tugas diselesaikan sebelum tenggat sesi |
| Efisiensi Penilaian | Waktu rata-rata mentor menyelesaikan rekap nilai dan feedback tugas per sesi | Berkurang dibanding proses manual (baseline sebelum sistem) |
| Kelulusan & Sertifikasi | Waktu penerbitan sertifikat sejak status "Lulus" ditetapkan | Otomatis, < 1 menit setelah status berubah |
| Kepercayaan Eksternal | Jumlah verifikasi sertifikat melalui halaman publik oleh pihak ketiga | Dipantau sebagai indikator kredibilitas program |
| Keterlihatan Portofolio | Jumlah kunjungan ke halaman portofolio publik siswa | Dipantau sebagai indikator manfaat bagi lulusan |
| Kepatuhan Administratif | Ketersediaan dan penggunaan fitur ekspor data oleh Super Admin/Mentor untuk pelaporan | Digunakan secara rutin setiap akhir program/periode pelaporan |
| Stabilitas Sistem | Uptime platform selama jam operasional bootcamp | ≥ 99% |

---

## 9. Asumsi & Batasan

- Seluruh siswa dan mentor memiliki perangkat (HP/laptop) dengan akses internet untuk menekan tombol absensi, mengakses materi, dan mengumpulkan tugas; manual override oleh mentor tersedia sebagai jaring pengaman bila siswa terkendala jaringan/perangkat.
- Kelas hibrida (online dan offline) diselenggarakan dengan konektivitas internet yang memadai bagi mentor untuk mengaktifkan status sesi secara real-time.
- Jumlah program (6) dan struktur sesi baku (10 sesi) per program bersifat tetap untuk fase awal peluncuran; jumlah batch per program tidak dibatasi dan dapat terus bertambah seiring berjalannya waktu.
- Setiap sesi baku wajib menyediakan 3 komponen: Slot Materi, Slot Tugas/Kuis, dan Button Absensi. Pengisian materi dan tugas/kuis bersifat opsional bagi Mentor, namun Absensi Siswa WAJIB ada dan dijalankan di setiap sesi.
- Hak akses upload materi dan tugas/kuis bersifat eksklusif bagi Mentor pengampu batch; Super Admin hanya memiliki hak akses melihat (read-only) pada sesi batch.
- Format kolom CSV untuk bulk import mengikuti template yang disediakan sistem; kesalahan format di luar template ditangani melalui alur validasi (FR-13), bukan diproses paksa.
- Materi video sepenuhnya bergantung pada ketersediaan platform hosting eksternal (YouTube/Vimeo); mentor bertanggung jawab memastikan tautan tetap dapat diakses siswa (misal pengaturan unlisted, bukan private tanpa akses).
- Standar nasional yang dimaksud untuk sertifikat mengacu pada kaidah umum sertifikat pelatihan yang diakui secara luas di Indonesia, bukan lisensi resmi dari lembaga sertifikasi profesi tertentu (kecuali ditentukan lebih lanjut oleh pemangku kepentingan).
- **Batch/angkatan baru dibuat secara manual oleh Super Admin dari salah satu dari 6 program yang ada; sistem tidak menjadwalkan batch secara otomatis pada fase awal.**
- **Kepatuhan menyeluruh terhadap UU PDP (termasuk kebijakan privasi formal dan penunjukan penanggung jawab perlindungan data bila diwajibkan berdasarkan skala pemrosesan) memerlukan tinjauan lebih lanjut oleh pihak legal lembaga penyelenggara sebelum peluncuran; PRD ini hanya mencakup kebutuhan teknis pendukungnya.**

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Siswa mencoba menekan tombol "Klik Absen" di luar jam kelas | Kecurangan data kehadiran | Tombol hanya aktif jika status sesi "Sedang Berjalan" (ongoing) yang dibuka oleh mentor; divalidasi ketat di sisi server dengan timestamp UTC |
| Koneksi internet siswa terputus saat sesi berlangsung | Siswa gagal menekan tombol absensi | **Manual Override (FR-19)** — mentor mencatat/mengubah status kehadiran siswa secara manual pada roster peserta sesi sebagai jaring pengaman resmi |
| Data CSV bulk import tidak rapi (duplikat, format salah) | Kegagalan onboarding massal, akun ganda | Validasi & pratinjau sebelum proses final (FR-13), partial success agar baris valid tetap diproses |
| Tautan/akses video eksternal berubah atau dicabut mentor | Siswa tidak dapat mengakses materi | Mentor bertanggung jawab memverifikasi aksesibilitas tautan; Super Admin dapat menjalankan pengecekan berkala (fase lanjutan) |
| Siswa terjebak (stuck) tidak lulus kuis dan tidak bisa lanjut materi | Menghambat progres belajar | Kebijakan retry yang dapat dikonfigurasi mentor + opsi mentor untuk override/skip secara manual |
| **Fitur unlock/override gating (FR-26A) digunakan berlebihan sehingga syarat penguasaan materi jadi longgar** | **Integritas penilaian & kelulusan menurun** | **Aksi unlock tercatat lengkap (mentor, siswa, alasan) untuk audit; kuis yang di-skip tetap perlu diselesaikan susulan; dipantau melalui rekap penggunaan override per mentor** |
| **Sertifikat dicabut (revoked) setelah dibagikan siswa ke pihak eksternal (misal sudah dilampirkan ke lamaran kerja)** | **Kebingungan/kerugian reputasi bagi siswa maupun lembaga** | **Halaman verifikasi publik menampilkan status Revoked secara jelas; pencabutan disertai alasan tercatat dan idealnya dikomunikasikan ke siswa terkait sebelum/saat status diubah** |
| Status siswa (drop-out/cuti) tidak tercatat, data tidak mencerminkan kondisi riil | Laporan kelulusan bias, akses siswa tidak sesuai kondisi | Manajemen status enrollment eksplisit (FR-29–FR-31) dengan penghentian akses otomatis saat status non-aktif |
| **Data antar-batch tidak terisolasi dengan benar (misal materi/nilai/kehadiran batch lama tercampur ke batch baru dari program yang sama)** | **Data siswa keliru, integritas nilai dan sertifikat terganggu** | **Enrollment dan seluruh data turunan (kehadiran, nilai, quiz attempt) direlasikan langsung ke batch, bukan hanya ke program; pengujian isolasi data antar-batch sebelum setiap batch baru diluncurkan** |
| Ketergantungan penuh pada satu vendor backend (Supabase) | Risiko keberlangsungan layanan | Backup data berkala, pemantauan status layanan Supabase, dan strategi mitigasi migrasi jika diperlukan di masa depan |
| Data nilai/sertifikat keliru akibat human error mentor | Kredibilitas sertifikat menurun | Alur approval/verifikasi Super Admin sebelum sertifikat final diterbitkan (opsional, dapat dievaluasi di fase berikutnya) |
| **Pelanggaran kepatuhan UU PDP (data disimpan tanpa persetujuan jelas atau tanpa kebijakan retensi)** | **Risiko hukum dan reputasi bagi lembaga penyelenggara** | **Consent eksplisit saat pendaftaran, kebijakan retensi data terdokumentasi, tinjauan legal sebelum peluncuran** |

---

## 11. Roadmap Implementasi (Indikatif)

| Fase | Cakupan |
|---|---|
| **Fase 1 — MVP** | Manajemen program (kurikulum baku) & batch/angkatan (termasuk penyesuaian materi/tugas per batch), autentikasi 3 role, reset password mandiri, bulk import siswa (CSV) ke batch + resend activation email, antarmuka 3 slot baku per sesi (materi, tugas/kuis, absensi), upload materi mentor (PDF/slide/gambar + embed video) dengan hak read-only admin, tombol "Klik Absen" sesi aktif + manual override mentor, kuis tersemat dengan gating + unlock manual per siswa, pengumpulan tugas siswa (upload/tautan) & review-feedback mentor, grading dasar, manajemen status enrollment dasar |
| **Fase 2** | Sertifikat digital otomatis + status Valid/Revoked, halaman portofolio publik, halaman verifikasi sertifikat, notifikasi in-app/email, ekspor data CSV/Excel rekap batch |
| **Fase 3** | Dashboard analitik lanjutan, bobot penilaian yang dapat dikonfigurasi, fitur retry kuis, audit log lengkap |
| **Fase 4 (opsional/lanjutan)** | Aplikasi mobile, integrasi payment, forum diskusi, multi-bahasa, pengecekan otomatis validitas tautan video eksternal, penjadwalan batch otomatis |

---

## 12. Glosarium

| Istilah | Definisi |
|---|---|
| **Bootcamp** | Program pelatihan intensif dengan struktur sesi yang jelas dan target kompetensi terukur |
| **Batch/Angkatan** | Satu kali penyelenggaraan suatu program bootcamp pada periode tertentu, dengan jadwal, mentor, dan siswa sendiri; satu program dapat memiliki banyak batch yang berjalan berurutan maupun paralel |
| **Klik Absen (Sesi Aktif)** | Mekanisme presensi mandiri oleh siswa melalui tombol di halaman sesi, yang hanya aktif ketika sesi telah dimulai ("Sedang Berjalan") oleh Mentor, dan otomatis terkunci ketika sesi ditutup |
| **Struktur 3 Slot Sesi** | Standar antarmuka pada setiap sesi pembelajaran yang wajib memuat 3 elemen: (1) Slot Materi, (2) Slot Tugas/Kuis, dan (3) Button Absensi Siswa |
| **Manual Override** | Mekanisme pencatatan atau pengubahan kehadiran siswa secara manual oleh mentor pada roster peserta sebagai jaring pengaman saat siswa terkendala perangkat/koneksi atau berhalangan hadir dengan izin |
| **Unlock Gating** | Aksi mentor membuka kunci akses materi/sesi berikutnya secara manual per siswa untuk kondisi dispensasi khusus, di luar alur gating standar |
| **Sertifikat Revoked** | Status sertifikat yang telah dicabut keabsahannya oleh Super Admin (misal karena kekeliruan data atau kecurangan), ditampilkan sebagai peringatan pada halaman verifikasi publik |
| **Bulk Import** | Proses pendaftaran/pemuatan data siswa secara massal melalui satu file (CSV) alih-alih satu per satu |
| **Enrollment Status** | Status keikutsertaan siswa dalam suatu batch: Aktif, Lulus, Tidak Lulus, atau Mengundurkan Diri |
| **Gating** | Mekanisme yang mengunci akses ke konten berikutnya hingga syarat tertentu (misal lulus kuis) terpenuhi |
| **RLS (Row Level Security)** | Fitur keamanan PostgreSQL/Supabase yang membatasi akses baris data berdasarkan identitas/role pengguna |
| **Portofolio Publik** | Halaman profil siswa yang dapat diakses publik, menampilkan sertifikat dan pencapaian belajar |
| **UU PDP** | Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, mengatur kewajiban pengelola dan pemroses data pribadi di Indonesia |

---

## 13. Lampiran — Pertanyaan Terbuka untuk Pembahasan Lanjutan

1. Apakah dibutuhkan alur approval Super Admin sebelum sertifikat final diterbitkan, atau cukup otomatis penuh?
2. Berapa batas toleransi waktu bagi siswa untuk menekan tombol "Klik Absen" setelah sesi dimulai oleh mentor (misalnya tombol otomatis terkunci setelah 30/60 menit, atau tetap aktif selama sesi berstatus "Sedang Berjalan")?
3. Apakah passing grade dan bobot penilaian bersifat seragam untuk seluruh 6 program, atau dapat berbeda per program (atau bahkan per batch)?
4. Apakah diperlukan integrasi dengan lembaga sertifikasi profesi resmi (misal BNSP) untuk memperkuat klaim "berstandar nasional"?
5. Bagaimana kebijakan terhadap siswa yang tidak memenuhi syarat kelulusan — apakah tersedia sertifikat partisipasi terpisah dari sertifikat kelulusan?
6. Apakah dibutuhkan status "Cuti" (sementara) terpisah dari "Mengundurkan Diri" (permanen) pada manajemen enrollment?
7. Siapa yang berwenang menyetujui perubahan status enrollment menjadi "Mengundurkan Diri" — cukup Super Admin, atau perlu persetujuan berlapis (misal juga mentor)?
8. Apakah mentor perlu memverifikasi ulang secara berkala bahwa tautan video eksternal yang disematkan masih aktif dan dapat diakses siswa?
9. **Apakah mentor yang sama dapat mengampu lebih dari satu batch secara bersamaan, dan apakah ada batas jumlah batch aktif per program dalam satu periode?**
10. **Apakah diperlukan kebijakan privasi (privacy policy) formal yang harus disetujui siswa saat pendaftaran, dan siapa yang bertanggung jawab menyusunnya secara legal?**
11. **Berapa batas ukuran maksimal file upload tugas (PDF/ZIP) ke Supabase Storage, dan apakah ada validasi format/tipe file di sisi klien sebelum diunggah?**
12. **Apakah siswa diperbolehkan mengumpulkan ulang (resubmit) tugas setelah menerima feedback mentor, atau hanya satu kali kesempatan pengumpulan per komponen penilaian?**

---

*Dokumen ini merupakan draft PRD (v1.5) dan terbuka untuk direvisi berdasarkan masukan tim engineering, desain, dan pemangku kepentingan bisnis E17 Course.*
