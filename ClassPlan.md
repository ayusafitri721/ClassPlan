# ClassPlan --- Rancangan Aplikasi Web Penjadwalan Perkuliahan

> Dokumen rancangan awal untuk mengembangkan aplikasi berbasis Graph
> Coloring dengan algoritma Welch Powell.\
> Versi: 1.0\
> Status: Draft rancangan

## 1. Gambaran Umum

**ClassPlan** adalah aplikasi web untuk membantu pengelolaan data
perkuliahan, mendeteksi konflik antarmata kuliah, memvisualisasikan graf
konflik, dan mengelompokkan mata kuliah menggunakan algoritma Welch
Powell.

Aplikasi ini dikembangkan dari studi kasus penyusunan jadwal perkuliahan
Kelas D Program Studi D3 Sistem Informasi UPN "Veteran" Jakarta.

### Tujuan aplikasi

1.  Memudahkan pengelolaan data mata kuliah dan dosen.
2.  Mengidentifikasi konflik berdasarkan aturan yang ditentukan.
3.  Membentuk graf konflik secara otomatis.
4.  Menjalankan algoritma Welch Powell.
5.  Menampilkan proses dan hasil pewarnaan graf secara transparan.
6.  Menyediakan laporan hasil analisis yang dapat diunduh.

### Batasan penting

Welch Powell menghasilkan **kelompok mata kuliah yang tidak saling
berkonflik berdasarkan model graf**, bukan otomatis menentukan hari dan
jam perkuliahan.

Untuk menghasilkan kalender jadwal yang benar-benar siap digunakan,
aplikasi masih membutuhkan proses penempatan waktu, ruang, durasi, dan
ketersediaan dosen.

## 2. Ruang Lingkup dan Aturan Konflik

Aplikasi perlu menyediakan aturan konflik yang jelas agar hasilnya tidak
disalahartikan.

### 2.1 Konflik berdasarkan dosen

Dua mata kuliah dihubungkan oleh sisi apabila memiliki setidaknya satu
dosen pengampu yang sama.

Contoh: - Dasar Pemrograman --- Praktikum Dasar Pemrograman. - Konsep
Basis Data --- Praktikum Konsep Basis Data. - Matematika Diskrit ---
Struktur Data. - Matematika Diskrit --- Praktikum Struktur Data. -
Struktur Data --- Praktikum Struktur Data.

### 2.2 Konflik berdasarkan kelompok mahasiswa

Dua mata kuliah juga dapat dianggap berkonflik apabila wajib diikuti
oleh kelompok mahasiswa yang sama dan dijadwalkan pada waktu yang sama.

**Catatan pemodelan:** Jika seluruh 10 mata kuliah Kelas D dianggap
selalu saling berbenturan hanya karena diikuti kelompok mahasiswa yang
sama, graf akan menjadi graf lengkap dan membutuhkan 10 warna. Karena
itu, aturan konflik mahasiswa harus diterapkan sesuai kebutuhan
penjadwalan sebenarnya, bukan otomatis menghubungkan semua mata kuliah
tanpa mempertimbangkan kemungkinan penempatan pada waktu berbeda.

### 2.3 Mode konflik yang disarankan

Pada halaman pengaturan analisis, sediakan pilihan: - **Konflik dosen**
--- untuk mereplikasi model dalam laporan. - **Konflik dosen dan aturan
kelas** --- untuk model yang lebih lengkap setelah data kelas/kelompok
mahasiswa tersedia.

Simpan mode yang digunakan pada setiap proses analisis agar hasil dapat
ditelusuri.

## 3. Pengguna dan Hak Akses

### Admin

-   Mengelola data mata kuliah.
-   Mengelola data dosen.
-   Menghubungkan dosen dengan mata kuliah.
-   Mengatur kelas dan semester.
-   Menjalankan analisis Welch Powell.
-   Melihat dan mengunduh laporan.

### Pengguna/pengamat (opsional)

-   Melihat data dan hasil analisis.
-   Melihat graf konflik.
-   Mengunduh laporan jika diberi izin.

Untuk versi awal, aplikasi dapat menggunakan satu peran admin agar
pengembangan lebih sederhana.

## 4. Struktur Halaman dan Navigasi

Navigasi utama yang disarankan:

1.  Dashboard
2.  Data Mata Kuliah
3.  Data Dosen
4.  Graf Konflik
5.  Analisis Welch Powell
6.  Hasil Pengelompokan
7.  Laporan
8.  Pengaturan

### 4.1 Dashboard

**Tujuan:** Memberikan ringkasan kondisi data dan hasil analisis
terakhir.

Komponen: - Total mata kuliah. - Total dosen. - Jumlah sisi/konflik yang
terdeteksi. - Jumlah warna yang dihasilkan. - Mode konflik yang
digunakan. - Ringkasan proses analisis terakhir. - Tombol "Mulai
Analisis".

Contoh data awal dari studi kasus: - 10 mata kuliah. - 5 sisi konflik
berdasarkan kesamaan dosen. - 3 warna pada hasil pewarnaan model konflik
dosen.

Angka tersebut adalah data studi kasus, bukan angka yang harus selalu
ditampilkan ketika data pengguna berubah.

### 4.2 Data Mata Kuliah

**Tujuan:** Mengelola daftar mata kuliah yang akan dianalisis.

Kolom tabel: - Kode mata kuliah. - Nama mata kuliah. - SKS. - Kelas. -
Semester. - Dosen pengampu. - Aksi (lihat, ubah, hapus).

Fitur: - Tambah mata kuliah. - Ubah data mata kuliah. - Hapus data mata
kuliah. - Cari berdasarkan kode atau nama. - Filter kelas dan
semester. - Impor data CSV (opsional).

Form tambah/edit: - Kode mata kuliah (wajib, unik dalam semester
terkait). - Nama mata kuliah (wajib). - SKS (wajib, bilangan positif). -
Kelas. - Semester. - Dosen pengampu (pilih satu atau lebih).

Validasi: - Kode tidak boleh duplikat pada lingkup semester yang sama. -
SKS harus berupa bilangan positif. - Mata kuliah harus memiliki minimal
satu dosen pengampu sebelum dianalisis, jika mode konflik dosen
digunakan.

### 4.3 Data Dosen

**Tujuan:** Menyimpan data dosen dan mengelola relasinya dengan mata
kuliah.

Kolom: - Nama dosen. - NIDN/NIP (opsional sesuai kebutuhan dan izin
penggunaan data). - Daftar mata kuliah yang diampu. - Aksi.

Fitur: - Tambah, ubah, dan hapus dosen. - Cari dosen. - Lihat daftar
mata kuliah yang diampu.

### 4.4 Graf Konflik

**Tujuan:** Memperlihatkan hubungan konflik antarmata kuliah dalam
bentuk graf.

Komponen: - Area visualisasi graf. - Simpul untuk setiap mata kuliah. -
Sisi untuk setiap konflik. - Legenda jenis konflik. - Panel detail
simpul. - Filter mode konflik.

Interaksi: - Klik simpul untuk melihat kode, nama mata kuliah, SKS, dan
dosen pengampu. - Sorot sisi untuk melihat alasan konflik. - Klik dua
simpul yang terhubung untuk melihat dosen atau aturan yang menyebabkan
konflik. - Atur ulang posisi simpul jika pustaka visualisasi
mendukungnya.

Informasi yang ditampilkan: - Jumlah simpul (\|V\|). - Jumlah sisi
(\|E\|). - Daftar sisi. - Derajat setiap simpul.

**Catatan:** Visualisasi graf sebelum pewarnaan sebaiknya dibedakan dari
graf setelah pewarnaan agar pengguna dapat melihat perubahan hasil
algoritma.

### 4.5 Analisis Welch Powell

**Tujuan:** Menjalankan algoritma dan memperlihatkan prosesnya.

Sebelum menjalankan: - Pilih kelas dan semester. - Pilih mode konflik. -
Pastikan data mata kuliah dan dosen sudah lengkap. - Tampilkan ringkasan
data yang akan dianalisis.

Tahapan yang ditampilkan:

**Tahap 1 --- Pembentukan graf** - Sistem membentuk simpul dari mata
kuliah. - Sistem membentuk sisi dari aturan konflik yang dipilih.

**Tahap 2 --- Perhitungan derajat** - Hitung jumlah tetangga setiap
simpul. - Tampilkan tabel derajat.

**Tahap 3 --- Pengurutan simpul** - Urutkan berdasarkan derajat terbesar
ke terkecil. - Jika derajat sama, gunakan SKS terbesar sebagai prioritas
kedua. - Jika derajat dan SKS sama, gunakan kode mata kuliah secara
alfabetis sebagai aturan pemecah seri.

Aturan pemecah seri harus konsisten dan ditampilkan kepada pengguna.
Aturan SKS adalah aturan tambahan aplikasi, bukan syarat asli algoritma
Welch Powell.

**Tahap 4 --- Pewarnaan** - Pilih simpul belum berwarna dengan urutan
tertinggi sebagai awal warna baru. - Telusuri simpul berikutnya. -
Berikan warna yang sama jika simpul belum berwarna dan tidak bertetangga
dengan simpul lain yang sudah menerima warna tersebut. - Ulangi sampai
semua simpul mendapat warna.

**Tahap 5 --- Validasi** - Pastikan semua simpul sudah berwarna. -
Pastikan tidak ada sisi yang menghubungkan dua simpul dengan warna
sama. - Hitung jumlah warna. - Tampilkan status validasi.

Fitur antarmuka: - Tombol "Jalankan Algoritma". - Tombol "Langkah
Berikutnya". - Tombol "Putar Otomatis". - Tombol "Ulangi". - Penanda
tahap yang sedang berjalan. - Tabel urutan simpul dan warna. - Graf yang
berubah warna sesuai langkah.

### 4.6 Hasil Pengelompokan

**Tujuan:** Menampilkan kelompok mata kuliah berdasarkan warna.

Setiap warna ditampilkan sebagai satu kelompok: - Nama/nomor kelompok. -
Daftar mata kuliah. - Total SKS kelompok (informasi tambahan, bukan
hasil utama algoritma). - Detail dosen pengampu. - Status validasi
konflik.

Untuk data studi kasus dalam laporan, model konflik dosen menghasilkan:

  Warna   Mata kuliah
  ------- --------------------------
  1       MD, DP, KBD, PA, PC, PBN
  2       SD, PDP, PKBD
  3       PSD

Jangan memberi label kelompok warna sebagai hari atau jam tertentu
sebelum proses penempatan waktu dilakukan.

### 4.7 Laporan

Isi laporan: 1. Identitas kelas dan semester. 2. Mode konflik yang
digunakan. 3. Daftar mata kuliah dan dosen. 4. Daftar sisi konflik. 5.
Matriks ketetanggaan. 6. Tabel derajat simpul. 7. Urutan simpul. 8.
Hasil pewarnaan. 9. Hasil validasi. 10. Analisis batas bawah dan
optimalitas, jika dapat dibuktikan. 11. Catatan keterbatasan model.

Fitur: - Pratinjau laporan. - Unduh PDF. - Ekspor tabel ke Excel/CSV
(opsional).

### 4.8 Pengaturan

-   Nama institusi.
-   Program studi.
-   Tahun akademik.
-   Semester.
-   Pengaturan aturan konflik.
-   Aturan pemecah seri pengurutan.
-   Preferensi tampilan.

## 5. Data Studi Kasus Awal

Gunakan data berikut sebagai data awal/dummy yang dapat diedit. Pastikan
kembali ejaan nama, kode, jadwal, dan dosen terhadap sumber akademik
sebelum aplikasi dipakai secara resmi.

  ----------------------------------------------------------------------------
  Kode             Mata Kuliah                        SKS Dosen
  ---------------- ---------------- --------------------- --------------------
  PA               Pendidikan Agama                     2 Dr. Badruddin;
                                                          Dr. Mukhrij Sidqy

  PC               Pancasila                            2 Fajar Setyaning Dwi
                                                          Putra; Dr. Hasan
                                                          Basri

  MD               Matematika                           3 RR Octanty
                   Diskrit                                Mulianingtyas;
                                                          Dr. Mufid Nilmada

  PBN              Pendidikan Bela                      2 Ir. Yuliana Yuli
                   Negara                                 Wahyuningsih;
                                                          Dr. Ernalem Bangun

  DP               Dasar                                2 Galih Prakoso Rizky
                   Pemrograman                            A

  PDP              Praktikum Dasar                      2 Galih Prakoso Rizky
                   Pemrograman                            A

  KBD              Konsep Basis                         2 Rasenda;
                   Data                                   Prof. Dr. Ermatita

  PKBD             Praktikum Konsep                     2 Rasenda
                   Basis Data                             

  SD               Struktur Data                        1 RR Octanty
                                                          Mulianingtyas;
                                                          Dr. Desta Sandya
                                                          Prasvita

  PSD              Praktikum                            2 RR Octanty
                   Struktur Data                          Mulianingtyas
  ----------------------------------------------------------------------------

### 5.1 Sisi konflik untuk mode konflik dosen

Berdasarkan kesamaan dosen dalam laporan:

-   MD --- SD
-   MD --- PSD
-   SD --- PSD
-   DP --- PDP
-   KBD --- PKBD

Jumlah simpul: 10.\
Jumlah sisi: 5.

### 5.2 Hasil acuan Welch Powell

Urutan simpul berdasarkan derajat menurun, dengan aturan pemecah seri
SKS menurun, dapat ditetapkan sebagai:

MD, SD, PSD, DP, PDP, KBD, PKBD, PA, PC, PBN.

Hasil pengelompokan acuan: - Warna 1: MD, DP, KBD, PA, PC, PBN. - Warna
2: SD, PDP, PKBD. - Warna 3: PSD.

Ketiga simpul MD, SD, dan PSD membentuk klik berukuran tiga. Karena itu,
diperlukan minimal tiga warna. Hasil tiga warna pada model konflik dosen
ini optimal.

## 6. Logika Algoritma

Pseudocode sederhana:

``` text
INPUT:
  daftar_mata_kuliah
  aturan_konflik

1. Buat satu simpul untuk setiap mata kuliah.

2. Untuk setiap pasangan mata kuliah:
     Jika memenuhi aturan_konflik:
       tambahkan sisi di antara kedua simpul.

3. Hitung derajat setiap simpul.

4. Urutkan simpul:
     derajat menurun,
     lalu SKS menurun,
     lalu kode menaik.

5. Set semua simpul sebagai belum berwarna.
   warna = 0

6. Selama masih ada simpul belum berwarna:
     warna = warna + 1
     pilih simpul belum berwarna pertama.
     beri simpul tersebut warna saat ini.

     Telusuri simpul berikutnya dalam urutan:
       jika belum berwarna dan tidak bertetangga
       dengan simpul lain yang sudah memiliki warna saat ini:
         beri warna saat ini.

7. Validasi:
     untuk setiap sisi (u, v):
       pastikan warna[u] != warna[v].

OUTPUT:
  graf konflik
  derajat simpul
  urutan simpul
  warna setiap simpul
  jumlah warna
  status validasi
```

## 7. Rancangan Database

Relasi tabel yang disarankan:

### `users`

  Kolom           Keterangan
  --------------- -----------------------------
  id              Primary key
  name            Nama pengguna
  email           Email
  password_hash   Password yang sudah di-hash
  role            Peran pengguna

### `courses`

  Kolom         Keterangan
  ------------- ------------------
  id            Primary key
  code          Kode mata kuliah
  name          Nama mata kuliah
  credits       Jumlah SKS
  class_id      Relasi kelas
  semester_id   Relasi semester

### `lecturers`

  Kolom           Keterangan
  --------------- ---------------------------
  id              Primary key
  name            Nama dosen
  lecturer_code   Identitas dosen, opsional

### `course_lecturers`

  Kolom         Keterangan
  ------------- --------------------
  id            Primary key
  course_id     Relasi mata kuliah
  lecturer_id   Relasi dosen

Tabel penghubung ini diperlukan karena satu mata kuliah dapat memiliki
beberapa dosen dan satu dosen dapat mengampu beberapa mata kuliah.

### `classes`

  Kolom           Keterangan
  --------------- ---------------
  id              Primary key
  name            Nama kelas
  study_program   Program studi

### `semesters`

  Kolom           Keterangan
  --------------- ----------------
  id              Primary key
  academic_year   Tahun akademik
  term            Ganjil/genap

### `scheduling_runs`

  Kolom               Keterangan
  ------------------- -----------------------
  id                  Primary key
  class_id            Kelas yang dianalisis
  semester_id         Semester
  conflict_mode       Mode konflik
  tie_break_rule      Aturan pemecah seri
  color_count         Jumlah warna
  validation_status   Status validasi
  created_at          Waktu analisis

### `schedule_results`

  Kolom          Keterangan
  -------------- ------------------------
  id             Primary key
  run_id         Relasi proses analisis
  course_id      Relasi mata kuliah
  color_number   Nomor warna/kelompok

Matriks ketetanggaan dan daftar sisi dapat dibentuk dari data mata
kuliah, dosen, serta aturan konflik. Jika diperlukan untuk audit, simpan
juga snapshot hasil analisis agar perubahan data di kemudian hari tidak
mengubah laporan historis.

## 8. Rekomendasi Teknologi

  -----------------------------------------------------------------------
  Bagian                  Teknologi               Kegunaan
  ----------------------- ----------------------- -----------------------
  Frontend                React.js                Antarmuka web

  Styling                 Tailwind CSS            Desain responsif

  Backend                 Node.js + Express.js    REST API dan logika
                                                  aplikasi

  Database                PostgreSQL              Penyimpanan data

  Visualisasi graf        React Flow atau         Menampilkan graf
                          Cytoscape.js            interaktif

  Algoritma               JavaScript              Implementasi Welch
                                                  Powell

  Validasi input          Zod atau library        Validasi data
                          sejenis                 

  Ekspor                  Library PDF dan Excel   Unduh laporan
  -----------------------------------------------------------------------

Algoritma Welch Powell sebaiknya ditempatkan pada modul/service backend
agar proses analisis dapat diuji dan dipanggil melalui API. Frontend
bertugas menampilkan data, visualisasi, dan tahapan proses.

## 9. Gambaran API Backend

Contoh endpoint REST:

  --------------------------------------------------------------------------------------
  Method                  Endpoint                            Fungsi
  ----------------------- ----------------------------------- --------------------------
  GET                     `/api/courses`                      Mengambil daftar mata
                                                              kuliah

  POST                    `/api/courses`                      Menambahkan mata kuliah

  GET                     `/api/lecturers`                    Mengambil daftar dosen

  POST                    `/api/lecturers`                    Menambahkan dosen

  POST                    `/api/courses/:id/lecturers`        Menghubungkan dosen dengan
                                                              mata kuliah

  POST                    `/api/graph/build`                  Membentuk graf konflik

  GET                     `/api/graph/:runId`                 Mengambil graf hasil
                                                              analisis

  POST                    `/api/scheduling-runs`              Menjalankan Welch Powell

  GET                     `/api/scheduling-runs/:id`          Mengambil hasil analisis

  GET                     `/api/scheduling-runs/:id/report`   Menghasilkan/menyediakan
                                                              laporan
  --------------------------------------------------------------------------------------

Contoh payload untuk menjalankan analisis:

``` json
{
  "classId": "class-d",
  "semesterId": "2026-2027-odd",
  "conflictMode": "lecturer",
  "tieBreakRule": ["credits_desc", "course_code_asc"]
}
```

Contoh respons ringkas:

``` json
{
  "runId": "run-001",
  "vertexCount": 10,
  "edgeCount": 5,
  "colorCount": 3,
  "isValid": true,
  "groups": [
    { "color": 1, "courses": ["MD", "DP", "KBD", "PA", "PC", "PBN"] },
    { "color": 2, "courses": ["SD", "PDP", "PKBD"] },
    { "color": 3, "courses": ["PSD"] }
  ]
}
```

## 10. Arah Visual Desain

### Gaya visual

-   Tampilan dashboard akademik yang bersih dan profesional.
-   Latar dominan putih atau abu-abu sangat muda.
-   Sidebar navy/dark blue.
-   Warna aksen biru untuk aksi utama.
-   Warna kelompok graf dibuat berbeda dan tetap mudah dibedakan.
-   Hindari terlalu banyak gradient, dekorasi, dan kartu statistik yang
    tidak diperlukan.

### Komponen UI

-   Sidebar navigasi.
-   Header halaman dan breadcrumb.
-   Tabel data.
-   Form modal atau halaman tambah/edit.
-   Filter dan pencarian.
-   Kartu ringkasan.
-   Area visualisasi graf.
-   Panel langkah algoritma.
-   Tabel hasil.
-   Tombol ekspor laporan.

### Responsivitas

-   Desktop: sidebar tetap terlihat dan area kerja lebar.
-   Tablet: sidebar dapat diciutkan.
-   Ponsel: navigasi menjadi menu ringkas; tabel dapat digulir
    horizontal; graf menyediakan kontrol zoom dan geser.

## 11. Tahapan Pengerjaan

### Tahap 1 --- Fondasi

-   Inisialisasi project frontend dan backend.
-   Buat database dan relasi.
-   Implementasi autentikasi admin sederhana.
-   Buat CRUD mata kuliah dan dosen.

### Tahap 2 --- Mesin Graph Coloring

-   Bentuk graf dari data dosen.
-   Buat daftar ketetanggaan dan matriks ketetanggaan.
-   Hitung derajat simpul.
-   Implementasikan pengurutan Welch Powell.
-   Implementasikan pewarnaan.
-   Buat validasi hasil.

### Tahap 3 --- Visualisasi dan hasil

-   Tampilkan graf konflik.
-   Tampilkan proses langkah demi langkah.
-   Tampilkan kelompok warna.
-   Buat halaman laporan.

### Tahap 4 --- Pengujian dan penyempurnaan

-   Uji data kosong dan data tidak lengkap.
-   Uji dosen yang mengampu banyak mata kuliah.
-   Uji mata kuliah dengan beberapa dosen.
-   Uji simpul dengan derajat sama.
-   Uji graf tanpa sisi dan graf lengkap.
-   Pastikan tidak ada dua simpul bertetangga yang mendapat warna sama.
-   Bandingkan hasil aplikasi dengan perhitungan manual.

## 12. Kriteria Keberhasilan

Aplikasi dianggap memenuhi kebutuhan versi awal apabila:

1.  Admin dapat menambah, mengubah, melihat, dan menghapus data mata
    kuliah serta dosen.
2.  Sistem dapat membentuk graf berdasarkan aturan konflik yang dipilih.
3.  Sistem dapat menghitung derajat dan mengurutkan simpul secara
    konsisten.
4.  Sistem dapat menjalankan algoritma Welch Powell.
5.  Sistem dapat menampilkan proses dan hasil pewarnaan.
6.  Sistem dapat memvalidasi bahwa setiap sisi menghubungkan dua simpul
    dengan warna berbeda.
7.  Sistem dapat menghasilkan laporan analisis.
8.  Hasil aplikasi untuk data studi kasus sesuai dengan hasil acuan yang
    sudah diverifikasi.

## 13. Pengembangan Lanjutan: Kalender Jadwal Nyata

Fitur ini bukan bagian inti Welch Powell, tetapi dapat menjadi
pengembangan setelah versi awal selesai.

Untuk mengubah kelompok warna menjadi jadwal perkuliahan nyata,
tambahkan: - Hari dan jam yang tersedia. - Durasi pertemuan. - Ruangan
dan kapasitas. - Ketersediaan dosen. - Kebutuhan laboratorium. - Batasan
waktu kelas mahasiswa.

Setelah itu, sistem dapat menempatkan kelompok mata kuliah ke slot waktu
yang memenuhi seluruh batasan. Hasilnya perlu divalidasi kembali karena
pewarnaan graf saja belum menyelesaikan seluruh persoalan penjadwalan.

------------------------------------------------------------------------

## Ringkasan Keputusan Produk

**Produk:** ClassPlan\
**Jenis:** Web-based academic scheduling analysis application\
**Metode utama:** Graph Coloring --- Welch Powell\
**Pengguna utama:** Admin akademik\
**Fokus MVP:** Data mata kuliah, data dosen, deteksi konflik,
visualisasi graf, algoritma Welch Powell, hasil pengelompokan, dan
laporan.\
**Batasan MVP:** Belum menjadwalkan hari, jam, dan ruangan secara
otomatis.

Prinsip utama pengembangan: tampilkan proses algoritma secara
transparan, gunakan aturan konflik yang eksplisit, dan jangan menyebut
kelompok warna sebagai jadwal final sebelum proses penempatan waktu
dilakukan.
