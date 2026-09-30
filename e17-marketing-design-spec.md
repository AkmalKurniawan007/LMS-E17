# Spesifikasi Desain — Halaman Marketing E17 Course

Dokumen ini adalah patokan visual untuk membangun ulang halaman marketing
E17 Course, terinspirasi struktur Kajabi (hero besar, section fitur jelas,
pricing card yang mudah dibandingkan) tetapi dengan identitas warna dan
kepribadian sendiri — bukan salinan warna Kajabi.

---

## 1. Prinsip Utama

- **Energetic & terpercaya.** E17 Course adalah bootcamp berstandar
  nasional dengan hasil terukur (nilai, sertifikat, portofolio). Desain
  harus terasa hangat dan bersemangat (kuning/oranye), tapi tetap rapi
  dan kredibel — bukan playful seperti produk anak-anak.
- **Satu elemen berani, sisanya tenang.** Kuning `#FFD400` dipakai besar
  di satu momen utama (hero), bukan ditabur di semua section. Section
  lain pakai kuning secukupnya sebagai aksen (badge, garis bawah, ikon).
- **Konten paket adalah sequence yang sah.** Paket 1/2/3 memang berjenjang
  (Junior → Expert → Komplit), jadi penomoran/label bertingkat pada
  pricing card dibenarkan di sini — bukan dekorasi generik.
- **Status akses harus terlihat dari desainnya sendiri.** Guest, user
  login, dan pembeli melihat versi visual yang berbeda pada area video —
  ini bagian dari desain, bukan cuma logika backend.

---

## 2. Design Tokens

### 2.1 Warna

| Token | Hex | Peran |
|---|---|---|
| `--color-primary` | `#FFD400` | Aksen utama, hero background, highlight, badge "Rekomendasi" |
| `--color-primary-ink` | `#2A2100` | Teks di atas area kuning (bukan hitam pekat, biar tidak keras) |
| `--color-accent-start` | `#FF7A1A` | Awal gradient CTA |
| `--color-accent-end` | `#FF3D68` | Akhir gradient CTA (sedikit merah muda, memberi energi tanpa jadi merah alarm) |
| `--color-bg` | `#FFFFFF` | Background utama |
| `--color-bg-soft` | `#FFFBEF` | Background section alternatif (krem sangat muda dari kuning, bukan abu-abu generik) |
| `--color-ink` | `#1C1A14` | Teks utama (hitam kecoklatan, senada dengan kuning — bukan `#000`/`#111` generik) |
| `--color-ink-muted` | `#6B6355` | Teks sekunder/deskripsi |
| `--color-border` | `#EFE6CC` | Border kartu, divider — turunan kuning pudar, bukan abu-abu netral |
| `--color-locked` | `#B8AF9C` | Ikon gembok/status terkunci untuk guest |

CTA gradient: `linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))`.

Jangan tambah warna baru di luar tabel ini tanpa alasan konten yang jelas
(misalnya warna status error/sukses boleh ditambah kalau memang perlu
untuk form checkout).

### 2.2 Tipografi

- **Font:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) —
  satu keluarga font, dipakai untuk display maupun body lewat perbedaan
  bobot (weight). Dipilih karena karakternya modern-geometris dengan
  sedikit kehangatan di bentuk hurufnya, dan namanya kebetulan selaras
  dengan lokasi produk ini (Jakarta) — pilihan yang related, bukan default.
- **Skala tipe:**

| Peran | Ukuran (desktop) | Ukuran (mobile) | Bobot |
|---|---|---|---|
| Display / H1 Hero | 56px | 34px | 800 (ExtraBold) |
| H2 Section | 36px | 26px | 700 (Bold) |
| H3 Card title | 22px | 20px | 700 (Bold) |
| Body besar (lead) | 18px | 16px | 500 (Medium) |
| Body normal | 16px | 15px | 400 (Regular) |
| Label kecil (badge, meta) | 13px | 13px | 600 (SemiBold), sentence case — **bukan ALL CAPS** |

- Lebar baris teks paragraf: maksimal ±75 karakter, jangan full-width di desktop.
- **Hindari:** menebalkan/mewarnai satu kata saja di headline, label ALL CAPS,
  eyebrow text yang tidak perlu di atas setiap heading, tanda panah "→"
  ditempel di akhir teks tombol.

### 2.3 Spacing & Layout

- Skala spacing: `4, 8, 12, 16, 24, 32, 48, 64, 96` (px) — pakai kelipatan ini
  konsisten untuk padding/margin, jangan angka bebas.
- Container max-width: `1200px`, padding horizontal `24px` di mobile, `48px`
  di desktop.
- Jarak antar-section: `96px` desktop, `56px` mobile.
- Grid pricing card: 3 kolom sejajar di desktop (≥1024px), 1 kolom
  bertumpuk di mobile, dengan urutan tetap Junior → Expert → Komplit.

### 2.4 Komponen

- **Border radius:** `16px` untuk card besar, `10px` untuk tombol/badge kecil.
  Konsisten di semua tempat — jangan campur radius berbeda di card sejenis.
- **Shadow:** satu jenis bayangan lembut untuk card mengambang:
  `0 8px 24px rgba(28,26,20,0.08)`. Jangan pakai bayangan abu-abu generik
  `rgba(0,0,0,.1)` di semua elemen tanpa alasan — pakai versi turunan
  warna ink di atas.
- **Tombol utama (CTA):** background gradient aksen, teks putih, radius `10px`,
  padding `14px 28px`. Teks aksi langsung: "Lihat Paket", "Mulai Belajar" —
  bukan kata generik seperti "Submit" atau "Klik Disini".
- **Tombol sekunder:** outline `1px solid var(--color-border)`, teks
  `var(--color-ink)`, background transparan.
- **Badge tier "Rekomendasi"** (untuk Paket 3/Komplit): pill kecil
  background `var(--color-primary)`, teks `var(--color-primary-ink)`.

---

## 3. Konsep Layout per Section

### 3.1 Hero

```
┌───────────────────────────────────────────────┐
│  [Logo]                       [Masuk] [Daftar] │
│                                                 │
│   Headline 2 baris, jelas dan spesifik          │
│   Subheadline 1-2 kalimat, nada percakapan      │
│   [CTA: Lihat Paket]  [CTA sekunder: Lihat Story]│
│                                                 │
│              (visual: cuplikan UI kelas / foto  │
│               mentor mengajar — bukan ilustrasi │
│               stok generik)                     │
└───────────────────────────────────────────────┘
```
Background hero: putih atau `--color-bg-soft`, dengan blok/bentuk kuning
`--color-primary` sebagai elemen visual besar di satu sisi (bukan gradient
penuh satu layar). Ini "momen berani" utama — section lain lebih tenang.

### 3.2 Story

Layout dua kolom di desktop: teks cerita di kiri (align kiri, bukan center),
foto/momen nyata program di kanan. Di mobile: foto di atas, teks di bawah.
Nada tulisan: percakapan, konkret, bukan bahasa marketing berlebihan.

### 3.3 Jalur Video: Junior & Expert

Dua kartu besar berdampingan (bukan grid generik seragam), masing-masing
dengan:
- Judul jalur (Junior / Expert)
- Deskripsi singkat untuk siapa jalur ini
- Daftar outline sesi (judul + durasi perkiraan) — **ini yang selalu
  terlihat oleh guest**
- Area video dengan status berbeda sesuai akses (lihat 3.5)

### 3.4 Pricing — 3 Paket

```
┌───────────┐  ┌───────────┐  ┌───────────┐
│  Paket 1  │  │  Paket 2  │  │ [Rekomendasi]│
│  Junior   │  │  Expert   │  │  Paket 3   │
│           │  │           │  │  Komplit   │
│  Rp ...   │  │  Rp ...   │  │  Rp ...    │
│  6 bulan  │  │  6 bulan  │  │  1 tahun   │
│  • fitur  │  │  • fitur  │  │  • fitur   │
│  [Pilih]  │  │  [Pilih]  │  │  [Pilih]   │
└───────────┘  └───────────┘  └───────────┘
```
Kartu Paket 3 sedikit lebih tinggi/menonjol (border `--color-primary`
2px, badge "Rekomendasi"), dua kartu lain netral dengan border standar.
Ini satu-satunya tempat card kembar dibenarkan — karena kontennya memang
tabel perbandingan tingkat.

### 3.5 Status Akses pada Area Video (penting — bagian dari desain, bukan cuma logic)

| Status user | Tampilan area video |
|---|---|
| Guest (belum login) | Tidak ada player. Ganti dengan card outline + ikon gembok kecil (`--color-locked`) + teks "Masuk untuk lihat cuplikan" |
| Login, belum beli | Player aktif untuk cuplikan, dengan badge kecil "Preview" di pojok video |
| Sudah beli (paket aktif) | Player penuh, tanpa badge, judul sesi ditandai selesai/belum via checkmark tipis |

### 3.6 CTA Akhir & Footer

CTA akhir: satu baris headline pendek + tombol utama, background
`--color-primary` penuh satu section (momen kedua yang boleh berani,
tapi hanya di sini). Footer: standar, netral, tidak perlu warna mencolok.

---

## 4. Motion

Satu momen animasi saja yang disengaja: reveal hero saat load pertama
(fade + sedikit gerak naik, durasi singkat). **Jangan** beri animasi
fade-slide-up di setiap section saat discroll, dan jangan beri hover
transition seragam di semua card — itu ciri khas desain generik.
Hormati `prefers-reduced-motion`.

---

## 5. Aksesibilitas & Kualitas Dasar

- Kontras teks di atas kuning (`--color-primary-ink` di atas
  `--color-primary`) harus lolos WCAG AA.
- Semua tombol dan link punya visible focus state (outline, bukan
  dihilangkan).
- Layout responsif utuh sampai lebar ±360px.
- Ikon gembok pada state guest harus punya alt text/aria-label yang
  jelas ("Konten terkunci, masuk untuk melihat cuplikan").

---

## 6. Catatan Implementasi untuk Antigravity

- Cek dulu apakah sudah ada Tailwind config / komponen Button, Card,
  Badge di project — pakai/extend itu, jangan bikin sistem styling paralel.
- Area video WAJIB mengambil data lewat RPC `get_program_materials`
  (lihat migrasi skema sebelumnya), bukan query langsung ke tabel —
  status akses di tabel 3.5 di atas bergantung pada `content_url`/
  `preview_url` yang dikembalikan RPC tersebut (null vs terisi).
- Kalau ada bagian token di atas yang bentrok dengan komponen yang
  sudah ada di project (misalnya radius atau shadow beda), laporkan
  dulu sebelum menimpa — jangan asumsikan versi baru selalu benar.
