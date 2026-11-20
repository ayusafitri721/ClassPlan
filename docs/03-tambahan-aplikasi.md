# Tambahan Laporan: Implementasi Aplikasi ClassPlan

Berkas ini berisi teks siap tempel untuk bagian aplikasi. Nomor tabel dan subbab dapat disesuaikan dengan templat laporan.

## Catatan sebelum menempel

Dokumen lama masih menulis hasil **2 warna**. Aplikasi menghasilkan **3 warna**. Perbaiki dulu bagian hitungan agar memakai hasil berikut:

| Aspek | Nilai |
|---|---|
| Simpul | 10 |
| Sisi | 5 |
| Derajat MK3, MK7, MK10 | 2, 2, 2 |
| Warna | 3 |
| Validasi | Valid |
| Batas bawah | 3 |
| Status | Optimal |
| Clique | MK3, MK7, MK10 |

Kelompok yang benar:

| Warna | Kode | Mata kuliah |
|---|---|---|
| 1 | MK1, MK2, MK3, MK4, MK5, MK6 | Pendidikan Agama, Pancasila, Matematika Diskrit, Pendidikan Bela Negara, Dasar Pemrograman, Konsep Basis Data |
| 2 | MK8, MK9, MK10 | Praktikum Dasar Pemrograman, Praktikum Konsep Basis Data, Praktikum Struktur Data |
| 3 | MK7 | Struktur Data |

Jika bagian aplikasi memakai hasil 2 warna, laporan akan bertentangan dengan aplikasi.

---

## 1. Tambahan di abstrak

Sisipkan satu kalimat sebelum kalimat penutup abstrak:

> Algoritma Welch-Powell diimplementasikan dalam aplikasi web ClassPlan yang mencakup pengelolaan data mata kuliah dan dosen, visualisasi graf konflik, pemutar langkah pewarnaan, serta laporan hasil analisis.

Versi Inggris:

> The Welch-Powell algorithm is implemented in a web application called ClassPlan, which supports course and lecturer data management, conflict graph visualization, a step-by-step coloring player, and analysis reports.

---

## 2. Subbagian baru di BAB III

Letakkan setelah 3.2 Perancangan Graf. Sesuaikan nomor subbab dan tabel.

### 3.3 Rancangan Implementasi Aplikasi

Penelitian ini tidak berhenti pada perhitungan manual. Algoritma Welch-Powell diimplementasikan dalam aplikasi web bernama ClassPlan agar data mata kuliah dan dosen dapat dikelola, graf konflik dapat diperiksa, dan hasil pewarnaan dapat ditelusuri langkah demi langkah. Aplikasi ini berfungsi sebagai alat bantu analisis, bukan pengganti penentuan jadwal oleh program studi.

Aplikasi memiliki enam bagian utama:

1. **Data master:** mata kuliah, dosen, kelas, dan semester.
2. **Graf konflik:** simpul mata kuliah, sisi dosen yang sama, derajat, dan alasan konflik.
3. **Analisis:** pengurutan simpul, pewarnaan Welch-Powell, validasi, dan perhitungan batas bawah.
4. **Hasil:** kelompok warna, jumlah anggota, dan total SKS.
5. **Laporan:** cetak A4 dan ekspor CSV.
6. **Pengaturan:** aturan pemecah seri serta data kelas dan semester.

Aplikasi dibangun dengan React dan Vite pada sisi antarmuka, React Flow untuk kanvas graf, Node.js dan Express pada sisi layanan, PostgreSQL untuk basis data, serta Tailwind CSS untuk tampilan. Autentikasi memakai sesi cookie.

Alur penggunaan aplikasi:

1. Pengguna masuk ke aplikasi.
2. Pengguna memilih kelas dan semester.
3. Pengguna mengisi atau memeriksa data mata kuliah dan dosen.
4. Pengguna membuka halaman graf konflik.
5. Pengguna menjalankan analisis Welch-Powell.
6. Pengguna melihat kelompok warna dan pemutar langkah.
7. Pengguna mencetak laporan atau mengunduh CSV.

Kesesuaian tahap penelitian dengan bagian aplikasi disajikan pada Tabel 3.3.

Tabel 3.3 Kesesuaian Tahap Penelitian dengan Bagian Aplikasi

| Tahap penelitian | Bagian aplikasi |
|---|---|
| Pengumpulan data mata kuliah dan dosen | Data master |
| Pembentukan graf konflik | Graf konflik |
| Perhitungan derajat simpul | Graf konflik dan analisis |
| Pewarnaan dengan Welch-Powell | Analisis |
| Validasi dan penilaian optimalitas | Hasil dan laporan |
| Penyusunan laporan penelitian | Laporan |

Kriteria keberhasilan implementasi:

1. Graf yang terbentuk memiliki 10 simpul dan 5 sisi.
2. Derajat setiap simpul sesuai dengan perhitungan manual.
3. Analisis menghasilkan 3 warna dan seluruh sisi memenuhi aturan pewarnaan.
4. Status optimal tercapai karena batas bawah tiga warna.
5. Laporan dapat dicetak dan data hasil dapat diunduh sebagai CSV.

Batasan implementasi:

1. Graf hanya memodelkan konflik dosen. Konflik akibat kelompok mahasiswa, ruang, dan kapasitas kelas belum dimodelkan.
2. Welch-Powell adalah algoritma heuristik. Status optimal hanya diklaim bila jumlah warna sama dengan batas bawah.
3. Keluaran aplikasi berupa kelompok warna, bukan jadwal hari, jam, atau ruang.

---

## 3. Subbagian baru di BAB IV

Letakkan setelah pembahasan bilangan kromatik. Sesuaikan nomor subbab dan tabel.

### 4.8 Implementasi dan Pengujian Aplikasi

Algoritma Welch-Powell diimplementasikan pada aplikasi web ClassPlan. Aplikasi dijalankan menggunakan data yang sama dengan perhitungan manual, yaitu sepuluh mata kuliah Kelas D, lima sisi konflik, dan enam kode dosen D1 sampai D6. Hasil aplikasi dibandingkan dengan perhitungan manual pada Tabel 4.5.

Tabel 4.5 Perbandingan Perhitungan Manual dan Hasil Aplikasi

| Aspek | Perhitungan manual | Hasil aplikasi |
|---|---|---|
| Jumlah simpul | 10 | 10 |
| Jumlah sisi | 5 | 5 |
| Derajat MK3, MK7, MK10 | 2, 2, 2 | 2, 2, 2 |
| Jumlah warna | 3 | 3 |
| Validasi sisi | Semua sisi aman | Valid |
| Batas bawah | 3 | 3 |
| Status | Optimal | Optimal |
| Clique | MK3, MK7, MK10 | MD, PSD, SD |

Kode mata kuliah pada aplikasi berbeda dengan kode penelitian. Padanan kodenya disajikan pada Tabel 4.6.

Tabel 4.6 Padanan Kode Penelitian dan Kode Aplikasi

| Kode penelitian | Kode aplikasi | Mata kuliah |
|---|---|---|
| MK1 | PA | Pendidikan Agama |
| MK2 | PC | Pancasila |
| MK3 | MD | Matematika Diskrit |
| MK4 | PBN | Pendidikan Bela Negara |
| MK5 | DP | Dasar Pemrograman |
| MK6 | KBD | Konsep Basis Data |
| MK7 | SD | Struktur Data |
| MK8 | PDP | Praktikum Dasar Pemrograman |
| MK9 | PKBD | Praktikum Konsep Basis Data |
| MK10 | PSD | Praktikum Struktur Data |

Aplikasi juga menampilkan proses pewarnaan langkah demi langkah. Setiap langkah mencatat simpul yang diberi warna, simpul yang dilewati, warna yang dibuka, dan warna yang ditutup. Setelah pewarnaan selesai, aplikasi memeriksa seluruh sisi dan menghitung batas bawah dari clique terbesar. Hasil analisis disimpan sebagai snapshot, sehingga perubahan data master tidak mengubah laporan yang sudah dibuat.

Pengujian antarmuka dilakukan pada lima halaman utama:

1. Halaman masuk.
2. Halaman graf konflik.
3. Halaman analisis dan pemutar langkah.
4. Halaman hasil pengelompokan.
5. Halaman laporan.

Setiap halaman diuji pada ukuran layar desktop dan seluler. Formulir diuji dengan data kosong, data valid, dan data yang menghasilkan galat. Hasil pengujian menunjukkan bahwa aplikasi dapat membentuk graf yang sama dengan perhitungan manual, menghasilkan tiga warna, dan menyatakan hasil valid serta optimal.

---

## 4. Tambahan di kesimpulan

Sisipkan sebagai poin terakhir:

> Algoritma Welch-Powell telah diimplementasikan dalam aplikasi web ClassPlan. Aplikasi menghasilkan graf dengan 10 simpul dan 5 sisi, tiga warna, serta status optimal yang sama dengan perhitungan manual. Aplikasi juga menyediakan pemutar langkah, validasi pewarnaan, dan laporan yang dapat dicetak.

---

## 5. Yang perlu dilampirkan

1. **Tangkapan layar** dengan keterangan yang menjelaskan isi, bukan hanya "tampilan aplikasi":
   - Graf konflik 10 simpul dan 5 sisi.
   - Pemutar langkah saat MK10 dan MK7 dilewati.
   - Kelompok warna beserta total SKS.
   - Laporan A4.
2. **Tautan aplikasi** jika sudah di-hosting. Kalau masih lokal, tulis "aplikasi dijalankan pada lingkungan lokal".
3. **Akun demo** di lampiran terpisah, bukan di badan laporan. Contoh: "Akun demo tersedia pada Lampiran 2."
4. **Petunjuk singkat satu halaman:** masuk, pilih kelas dan semester, jalankan analisis, baca hasil, cetak laporan.
5. **Tautan repositori** jika ada. Kalau tidak ada, tulis "kode sumber diserahkan bersama laporan".

---

## 6. Kalimat untuk menjelaskan hubungan aplikasi dan penelitian

Kalau dosen bertanya "ini implementasinya di mana", jawab dengan satu paragraf ini:

> Perhitungan manual pada BAB IV menjadi acuan. Aplikasi web ClassPlan adalah implementasi dari perhitungan tersebut. Aplikasi membangun graf dari data mata kuliah dan dosen, menjalankan Welch-Powell, memvalidasi seluruh sisi, dan menghitung batas bawah. Hasilnya sama dengan perhitungan manual, yaitu 5 sisi, 3 warna, dan status optimal dengan clique MK3, MK7, dan MK10. Aplikasi tidak menggantikan keputusan akademik, tetapi membantu menelusuri proses dan menyusun laporan.

---

## 7. Jika dokumen ini masih proposal

Ubah kalimat hasil menjadi rencana:

- "diimplementasikan" menjadi "akan diimplementasikan"
- "menghasilkan" menjadi "diharapkan menghasilkan"
- "Hasil pengujian menunjukkan" menjadi "Pengujian akan dilakukan untuk menunjukkan"

Contoh:

> Algoritma Welch-Powell akan diimplementasikan dalam aplikasi web ClassPlan. Aplikasi diharapkan menghasilkan graf dengan 10 simpul dan 5 sisi, tiga warna, serta status optimal yang sama dengan perhitungan manual.

---

## 8. Checklist sebelum dikumpulkan

- [ ] Hasil hitungan sudah 3 warna, bukan 2.
- [ ] Derajat MK7 dan MK10 sudah 2.
- [ ] Sisi MK7-MK10 sudah ada di tabel sisi.
- [ ] Nama mata kuliah sudah memakai daftar resmi.
- [ ] Subbab aplikasi sudah ditempel di BAB III dan BAB IV.
- [ ] Abstrak dan kesimpulan sudah menyebut aplikasi.
- [ ] Tangkapan layar sudah diberi keterangan.
- [ ] Akun demo dan tautan aplikasi ada di lampiran.
- [ ] Nomor tabel dan subbab sudah disesuaikan.
