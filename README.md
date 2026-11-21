# ClassPlan

Aplikasi web untuk menganalisis pengelompokan mata kuliah dengan graf konflik dan algoritma Welch Powell. Hasil analisis berupa kelompok warna, bukan jadwal hari, jam, atau ruang.

Dokumen acuan: `ClassPlan.md`. Rencana teknis: `docs/01-rencana.md`. Arah desain: `docs/DESIGN.md`. Catatan verifikasi: `docs/02-verifikasi.md`.

## Stack

- Frontend: React 19, Vite, React Router, TanStack Query, React Hook Form, Zod, React Flow, Tailwind CSS v4.
- Backend: Node.js, Express 5, `pg` dengan SQL mentah, JWT di cookie httpOnly.
- Database: PostgreSQL 16.
- Monorepo npm workspaces: `shared`, `server`, `client`.
- Bahasa kode dan UI: JavaScript dan Indonesia. Tanpa TypeScript.

## Menjalankan

Prasyarat: Node.js 22 atau lebih baru, npm 10 atau lebih baru, dan Docker Desktop.

```bash
npm install
copy .env.example .env
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

Buka `http://localhost:5173`. API berjalan di `http://localhost:4000`.

Akun hasil seed:

```text
Email    : admin@classplan.local
Sandi    : classplan123
```

Ganti `JWT_SECRET` dan kata sandi seed sebelum dipakai di luar lingkungan lokal.

## Perintah

| Perintah | Kegunaan |
|----------|----------|
| `npm run dev` | Menjalankan API dan Vite sekaligus |
| `npm run dev -w server` | Hanya API, dengan `node --watch` |
| `npm run dev -w client` | Hanya Vite |
| `npm test` | Uji algoritma dengan Vitest |
| `npm run build` | Build produksi frontend |
| `npm run db:up` | Menyalakan PostgreSQL lewat Docker Compose |
| `npm run db:down` | Mematikan container |
| `npm run db:migrate` | Menerapkan migrasi SQL |
| `npm run db:seed` | Mengisi admin dan data studi kasus |
| `npm run db:reset` | Menghapus skema, migrasi ulang, lalu seed |

`db:reset` menghapus seluruh data. Pakai hanya saat ingin memulai dari nol.

## Struktur

```text
ClassPlan/
  shared/            Konstanta, skema Zod, label yang dipakai klien dan server
  server/
    src/algorithm/   buildGraph, ordering, welshPowell, validateColoring, maxClique
    src/db/          Pool, migrasi, seed, kueri scope, reset
    src/modules/     auth, courses, lecturers, classes, semesters, settings,
                     dashboard, graph, runs
    src/middleware/  Auth, validasi, penanganan galat
    tests/           Uji algoritma dan studi kasus
  client/
    src/api/         Klien fetch dan daftar endpoint
    src/components/  Layout, UI kit, node graf
    src/hooks/       Query TanStack dan pemilih scope
    src/pages/       Login, Dashboard, Mata Kuliah, Dosen, Graf, Analisis,
                     Hasil, Laporan, Pengaturan, 404
  docs/              Rencana, desain, verifikasi
```

## Cakupan data

Seed memuat dua kelas pada semester 2026/2027 ganjil. Angkatan adalah kolom
pada tabel `classes`, terpisah dari tahun akademik di tabel `semesters`.

| Cakupan | Mata kuliah | Sisi konflik dosen | Warna | Status |
|---------|-------------|--------------------|-------|--------|
| Kelas D angkatan 2026 | 10 | 5 | 3 | Optimal |
| Kelas D angkatan 2025 | 14 | 16 | 5 | Optimal |
| Gabungan 2025 + 2026 | 24 | 34 | 7 | Optimal |

Angkatan 2026 tetap menjadi scope default supaya hasil studi kasus lama
(10/5/3) tidak berubah. Analisis bisa dijalankan per angkatan atau untuk
semua kelas sekaligus lewat opsi "Gabungkan semua kelas" di halaman
Welch Powell. Graf pratinjau punya opsi cakupan yang sama.

Jadwal kuliah (hari, jam mulai, jam selesai) disimpan sebagai metadata dan
tampil di tabel mata kuliah serta laporan. Jadwal **tidak** dipakai sebagai
aturan pembentuk sisi; konflik tetap ditentukan oleh kesamaan dosen.

Dosen yang sama antarangkatan dinormalisasi ke satu ID. Galih Prakoso Rizky A
mengampu 7 mata kuliah lintas angkatan dan membentuk clique berukuran 7,
sehingga batas bawah gabungan adalah 7 warna.

## Alur analisis

1. Mata kuliah pada kelas dan semester terpilih dibentuk menjadi simpul.
2. Dua mata kuliah dihubungkan bila memiliki minimal satu dosen pengampu yang sama.
3. Simpul diurutkan menurut derajat menurun, lalu SKS menurun, lalu kode menaik.
4. Welch Powell mewarnai setiap simpul dengan warna pertama yang tidak dipakai tetangganya.
5. Hasil divalidasi terhadap seluruh sisi. Batas bawah dihitung dari clique maksimum.
6. Graf, trace langkah, hasil, dan pengaturan disimpan sebagai snapshot.

Status "Optimal" hanya ditampilkan bila jumlah warna sama dengan batas bawah. Bila belum sama, statusnya "Belum terbukti optimal", karena Welch Powell adalah heuristik.

## Keputusan penting

### Urutan studi kasus

Data dokumen memuat SD = 1 SKS, sehingga aturan tertulis menghasilkan urutan `MD, PSD, SD, DP, ...` dan kelompok kedua berisi `PSD, PDP, PKBD`. Hasilnya tetap 3 warna dan terbukti optimal karena MD, PSD, SD membentuk K3. Ini disebut skenario A1 pada `docs/01-rencana.md`. Bila SKS SD diperbaiki menjadi 3, aturan yang sama menghasilkan urutan acuan dokumen tanpa perubahan kode.

### Mode konflik kelas

Versi ini hanya membangun graf dari kesamaan dosen. Mode dosen dan kelas tidak diaktifkan karena seluruh mata kuliah dalam satu kelas dan semester akan saling berkonflik, sehingga grafnya menjadi K10 dan hasilnya 10 warna. Penjelasan ditampilkan di halaman Pengaturan, bukan sebagai tombol mati.

### Warna bukan jadwal

Kelompok warna hanya berarti tidak ada dosen yang bentrok di dalam kelompok. Aplikasi tidak menentukan hari, jam, atau ruang.

## Laporan

Halaman Laporan memakai tata letak A4 dan tombol cetak peramban untuk menyimpan PDF. Aktifkan opsi grafik latar pada dialog cetak agar warna kelompok tercetak. CSV diunduh dari endpoint server dan memakai snapshot hasil analisis.

## Uji

```bash
npm test
```

Uji mencakup pembentukan graf, urutan dan pemecah seri, Welch Powell pada graf kosong, lengkap, dan K3, validasi pewarnaan, studi kasus 10 mata kuliah dengan 5 sisi dan 3 warna, scope angkatan 2025 (14 simpul, 16 sisi, 5 warna), serta scope gabungan (24 simpul, 34 sisi, 7 warna).

`algorithmRigor.test.js` menguji logika lebih dalam: perbandingan `maxClique`
dengan brute force pada 30 graf acak, fallback greedy di atas 32 simpul,
invarian pewarnaan pada 30 graf acak, determinisme, kesesuaian trace dengan
hasil akhir, contoh graf yang membuktikan Welch Powell tidak selalu minimum,
matriks ketetanggaan, dan escape CSV.
