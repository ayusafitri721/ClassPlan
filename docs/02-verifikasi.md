# ClassPlan: Catatan Verifikasi

Diperbarui 19 November 2026. Catatan ini merangkum apa yang sudah diuji pada aplikasi yang berjalan lokal, bukan sekadar daftar fitur.

## Lingkungan

- Windows, Node.js dan npm dari mesin pengembangan.
- PostgreSQL 16 lewat Docker Compose, basis data `classplan`.
- API di `http://localhost:4000`, Vite di `http://localhost:5173`.
- Chrome 143 headless untuk pemeriksaan antarmuka.

## Uji otomatis

```text
npm test
6 berkas uji, 45 uji lulus
- welshPowell.test.js     6 uji
- buildGraph.test.js      5 uji
- ordering.test.js        6 uji
- caseStudy.test.js       7 uji
- cohort2025.test.js      6 uji
- algorithmRigor.test.js 15 uji
```

Kasus studi pada `caseStudy.test.js` memakai data seed: 10 mata kuliah, 5 sisi, 3 warna, pewarnaan valid, dan status terbukti optimal karena ada clique `MD, PSD, SD`.

```text
npm run build -w client
Berhasil. Bundel terbesar 324 kB (101 kB gzip) dan 192 kB (63 kB gzip).
```

Build memakai pemecahan halaman per rute, sehingga halaman laporan dan analisis tidak masuk bundel awal.

## Pengujian logika algoritma

`algorithmRigor.test.js` berisi 15 uji yang menyerang logika, bukan tampilan:

- `maxClique` dibandingkan dengan pencarian brute force seluruh subset pada
  30 graf acak berukuran 5 sampai 8 simpul. Ukuran cliques sama, dan clique
  yang dikembalikan benar-benar lengkap.
- Untuk 33 simpul, `maxClique` memakai greedy, menandai `exact: false`, dan
  tetap mengembalikan clique yang valid (K5 + 28 simpul terisolasi).
- 30 graf acak lainnya dipakai untuk memeriksa invarian Welch Powell:
  validasi lolos, kelompok merupakan partisi seluruh simpul, jumlah warna
  tidak lebih kecil dari batas bawah dan tidak lebih besar dari jumlah
  simpul.
- Dua analisis dengan data sama menghasilkan urutan dan pewarnaan identik.
- Trace yang diputar sampai langkah terakhir menghasilkan peta warna yang
  sama dengan hasil akhir. Ini menjamin pemutar frontend dan laporan
  memakai sumber kebenaran yang sama.
- Ada satu graf 7 simpul dengan 14 sisi yang oleh Welch Powell diwarnai
  dengan 5 warna, padahal graf tersebut bisa diwarnai dengan 4 warna dan
  batas bawah cliquenya 4. Status yang dihasilkan `not_proven` dengan
  `gap = 1`. Ini bukti bahwa aplikasi tidak mengklaim optimal secara
  sembarangan.
- Matriks ketetanggaan pada laporan simetris, diagonalnya nol, dan jumlah
  entri 1 sama dengan dua kali jumlah sisi.
- CSV meng-escape koma, kutip ganda, semicolon, dan baris baru, serta
  memakai BOM UTF-8.

## Pemeriksaan API

Dengan cookie sesi hasil login:

- `GET /api/auth/me` mengembalikan pengguna aktif.
- `GET /api/classes` dan `GET /api/semesters` mengembalikan data seed.
- `GET /api/courses?classId=1&semesterId=1` mengembalikan 10 mata kuliah.
- `GET /api/graph?classId=1&semesterId=1&conflictMode=lecturer` mengembalikan 10 simpul dan 5 sisi.
- `POST /api/scheduling-runs` membuat snapshot baru dan mengembalikan 3 warna, valid, optimal.
- `GET /api/scheduling-runs` dan `GET /api/settings` mengembalikan data tersimpan.
- Ekspor CSV mengunduh `classplan-run-<id>.csv` lewat tautan laporan.

Sisi yang diharapkan: `DP-PDP`, `KBD-PKBD`, `MD-PSD`, `MD-SD`, `PSD-SD`.

Verifikasi ulang setelah penambahan angkatan 2025 (2026/2027 ganjil):

- `GET /api/classes` mengembalikan dua kelas: Kelas D angkatan 2026 dan 2025.
- `GET /api/graph` untuk angkatan 2025 mengembalikan 14 simpul dan 16 sisi.
- `GET /api/graph` dengan `classIds=1,3` mengembalikan 24 simpul dan 34 sisi.
- `POST /api/scheduling-runs` per angkatan 2025 menghasilkan 5 warna, valid,
  optimal, dengan clique `IMK1, IMK2, PIMK, PPW, PW`.
- `POST /api/scheduling-runs` gabungan menghasilkan 7 warna, valid, optimal,
  dengan clique `DP, IMK1, IMK2, PDP, PIMK, PPW, PW`.
- Run gabungan muncul pada riwayat kedua angkatan karena `run_scopes`.
- `GET /api/scheduling-runs/:id/report` memuat `scopeLabel`, `isCombined`,
  serta field `dayOfWeek`, `startTime`, dan `endTime` pada tiap mata kuliah.
- Form mata kuliah dengan jadwal dikosongkan tetap tersimpan sebagai `null`.

## Pemeriksaan antarmuka

Alur berikut dijalankan di Chrome dengan sesi baru, tanpa error halaman:

1. Login menampilkan formulir, lalu masuk ke Dashboard.
2. Dashboard menampilkan ringkasan scope dan run terakhir.
3. Mata kuliah: daftar, pencarian, form tambah, ubah, dan hapus.
4. Dosen: daftar, form tambah, ubah, hapus, dan panel mata kuliah yang diampu.
5. Graf konflik: 10 simpul tampil, klik simpul membuka detail dosen dan derajat.
6. Analisis: tombol jalan aktif, hasil 3 warna, pemutar langkah mundur dan maju.
7. Hasil pengelompokan: tiga kartu warna, label bahwa kelompok bukan jadwal.
8. Laporan: 11 bagian, tabel dan matriks ikut tercetak.
9. Pengaturan: kelas dan semester dapat ditambah, diubah, dan dihapus; aturan seri dapat disimpan.
10. Laci navigasi seluler terbuka dan tertutup lewat tombol.
11. Halaman 404 tampil untuk rute yang tidak dikenal.

Pemeriksaan tambahan:

- Ekspor CSV berhasil diunduh dan isinya memuat kolom kelompok, kode, mata kuliah, SKS, derajat, dan dosen.
- Cetak laporan ke PDF menghasilkan 6 halaman A4 dengan warna kelompok ikut tercetak saat opsi grafik latar aktif.
- URL dengan `class=99&semester=99` kembali ke kelas dan semester yang valid, bukan menampilkan halaman kosong.
- Tampilan 390 px: tabel mata kuliah memakai kolom kode lengket saat digeser ke samping.

## Perbaikan selama verifikasi

- Panel analisis membaca data dashboard dari `dashboard.data.dashboard`, bukan objek query, sehingga tombol jalan tidak lagi nonaktif.
- Form mata kuliah memakai `Controller` untuk daftar dosen, karena `register` pada banyak checkbox tidak menyimpan pilihan dengan benar.
- Tombol simpan pengaturan tidak lagi bergantung pada status `isDirty` yang tidak pernah berubah saat pilihan aturan seri diganti.
- Parameter scope yang tidak valid dinormalkan ke pilihan pertama yang tersedia.
- Target sentuh tombol kecil dan tautan navigasi dinaikkan ke 44 px pada layar sentuh.
- Kolom kode pada tabel mata kuliah dibuat lengket agar tetap terlihat saat tabel digeser.
- Teks bantuan cetak memakai istilah Indonesia, bukan "Background graphics".

## Catatan perilaku

- Saat membuka halaman login tanpa sesi, peramban mencatat satu galat 401 dari `GET /api/auth/me`. Ini pemeriksaan sesi yang disengaja, bukan kegagalan aplikasi. Setelah login, permintaan itu mengembalikan 200.
- Nomor halaman laporan diserahkan ke dialog cetak peramban. Aplikasi tidak menggambar nomor sendiri agar tidak terjadi nomor ganda.
- Pemutar langkah tidak mengubah fokus atau zoom kanvas setiap langkah. Pengguna dapat menggeser dan memperbesar kanvas tanpa direbut kembali.
- Hasil analisis memakai snapshot. Mengubah data master setelah analisis tidak mengubah laporan lama.
- Status "Terbukti optimal" hanya muncul bila jumlah warna sama dengan batas bawah clique maksimum. Bila belum sama, laporan memakai status "Belum terbukti optimal".

## Data setelah verifikasi

Data uji sementara seperti mata kuliah, dosen, kelas, dan semester contoh sudah dihapus. Basis data menyisakan data seed dan satu riwayat analisis (RUN-1) dengan 10 simpul, 5 sisi, dan 3 warna.

## Mengulang pemeriksaan

```bash
npm run db:reset
npm run dev
```

Setelah aplikasi terbuka, masuk dengan `admin@classplan.local` dan `classplan123`, buka halaman Analisis, lalu jalankan algoritma. Bandingkan hasil dengan bagian kasus studi pada `docs/01-rencana.md`.
