# Rencana Lampiran dan Tangkapan Layar

Berkas ini mengatur isi lampiran laporan dan daftar tangkapan layar yang perlu diambil. Semua gambar dikumpulkan di satu lampiran, tidak disebar ke badan laporan.

## Struktur lampiran

| Lampiran | Isi | Ada gambar |
|---|---|---|
| Lampiran 1 | Petunjuk penggunaan aplikasi | Tidak, teks langkah |
| Lampiran 2 | Akun demo | Tidak, satu tabel |
| Lampiran 3 | Tangkapan layar | Ya, semua di sini |
| Lampiran 4 | Teknologi yang dipakai | Tidak, satu tabel |

Letak: setelah DAFTAR PUSTAKA, setiap lampiran mulai di halaman baru.

---

## Lampiran 1 Petunjuk Penggunaan Aplikasi

Tulis sebagai langkah bernomor, tanpa gambar.

1. Buka aplikasi ClassPlan pada peramban.
2. Masuk menggunakan akun yang tertera pada Lampiran 2.
3. Pilih kelas dan semester pada bilah atas.
4. Buka menu Data Master untuk memeriksa daftar mata kuliah, dosen, dan SKS.
5. Buka menu Graf untuk melihat simpul, sisi, derajat, dan alasan konflik.
6. Buka menu Analisis, lalu jalankan analisis Welch-Powell.
7. Baca ringkasan: jumlah warna, status validasi, batas bawah, dan status optimal.
8. Gunakan pemutar langkah untuk menelusuri urutan pewarnaan.
9. Buka menu Hasil untuk melihat kelompok warna dan total SKS.
10. Buka menu Laporan untuk mencetak laporan A4 atau mengunduh CSV.

---

## Lampiran 2 Akun Demo

| Peran | Email | Kata sandi |
|---|---|---|
| Administrator | admin@classplan.local | (isi sesuai lingkungan demo) |

Catatan: jangan menulis kata sandi asli di badan laporan. Ganti bila aplikasi dipakai di luar lingkungan lokal.

---

## Lampiran 3 Tangkapan Layar

Ambil enam gambar, urut sesuai alur pemakaian.

| No | Halaman | Yang harus terlihat | Caption |
|---|---|---|---|
| 1 | Masuk | Formulir email dan kata sandi, judul aplikasi | Gambar L.1 Halaman Masuk Aplikasi ClassPlan |
| 2 | Graf | 10 simpul, 5 sisi, derajat tiap simpul | Gambar L.2 Graf Konflik Kelas D dengan Sepuluh Simpul dan Lima Sisi |
| 3 | Analisis | Ringkasan 3 warna, valid, batas bawah 3 | Gambar L.3 Ringkasan Hasil Analisis Welch-Powell |
| 4 | Analisis | Pemutar langkah saat MK10 dan MK7 dilewati | Gambar L.4 Langkah Pewarnaan Saat MK10 dan MK7 Dilewati |
| 5 | Hasil | Tabel kelompok warna, jumlah anggota, total SKS | Gambar L.5 Kelompok Mata Kuliah Berdasarkan Warna |
| 6 | Laporan | Halaman pertama laporan A4 | Gambar L.6 Laporan Hasil Analisis Siap Cetak |

Gambar 4 paling penting karena menjadi bukti bahwa sisi MK3-MK10, MK3-MK7, dan MK7-MK10 benar-benar dihitung.

Gambar 1 boleh dilewati bila tidak diminta. Gambar 6 boleh dilewati bila laporan cetak tidak dinilai.

Setiap gambar diberi keterangan sumber di bawah caption:

> Sumber: hasil penelitian, 2026

---

## Lampiran 4 Teknologi yang Dipakai

| Bagian | Teknologi |
|---|---|
| Antarmuka | React, Vite, Tailwind CSS |
| Visualisasi graf | React Flow |
| Layanan | Node.js, Express |
| Basis data | PostgreSQL |
| Autentikasi | Sesi cookie |

---

## Cara Menaruh di Word

1. Tulis judul **LAMPIRAN 3 TANGKAPAN LAYAR** di halaman baru.
2. Tempel gambar satu per satu, masing-masing di paragraf sendiri.
3. Klik gambar, pilih **References > Insert Caption**.
4. Pilih label **Gambar**, atur penomoran menjadi **L.1, L.2, dan seterusnya**.
5. Tulis sumber di bawah caption.
6. Beri satu baris kosong antar gambar.

---

## Aturan Penomoran

| Lokasi | Format nomor |
|---|---|
| Badan laporan | Gambar 4.1, Gambar 4.2 |
| Lampiran | Gambar L.1, Gambar L.2 |
| Tabel badan | Tabel 4.1, Tabel 4.2 |
| Tabel lampiran | Tabel L.1, Tabel L.2 |

Jangan mencampur nomor badan dan nomor lampiran.

---

## Rujukan di Badan Laporan

Cukup satu kalimat di subbab implementasi:

> Graf konflik yang dihasilkan aplikasi ditunjukkan pada Gambar L.2. Proses pewarnaan langkah demi langkah, termasuk saat MK10 dan MK7 dilewati, ditunjukkan pada Gambar L.4.

---

## Yang Tidak Boleh Masuk Badan Laporan

1. Kredensial login.
2. Potongan kode program.
3. Seluruh isi basis data.
4. Tangkapan layar tanpa keterangan.
5. Tangkapan layar yang menampilkan kata sandi.

---

## Checklist

- [ ] Lampiran 3 berisi semua gambar, tidak tersebar di BAB IV.
- [ ] Nomor gambar memakai format L.1, bukan 4.1.
- [ ] Setiap gambar punya caption yang menyebut isinya.
- [ ] Setiap gambar punya keterangan sumber.
- [ ] Gambar 4 memperlihatkan MK10 dan MK7 dilewati.
- [ ] Kata sandi tidak terlihat di gambar mana pun.
- [ ] Badan laporan merujuk gambar, bukan menampilkannya ulang.
