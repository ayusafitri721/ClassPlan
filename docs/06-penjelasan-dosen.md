    # Panduan Menjelaskan ClassPlan ke Dosen

Berkas ini berisi kalimat yang bisa dibaca langsung saat presentasi, penjelasan tiap menu di sidebar, urutan demo, dan antisipasi pertanyaan.

---

## 1. Kalimat pembuka

> Penelitian kami mengelompokkan sepuluh mata kuliah Kelas D menggunakan pewarnaan graf dengan algoritma Welch-Powell. Konflik dibentuk dari dosen yang mengampu mata kuliah yang sama. Hasilnya tiga warna, dan kami buktikan hasil itu optimal. Kami juga membuat aplikasi web yang menjalankan proses yang sama, dan hasilnya identik dengan perhitungan manual.

Satu kalimat tambahan untuk menjelaskan sidebar:

> Sidebar dibagi empat bagian: Ringkasan, Data, Analisis, dan Laporan. Susunannya sama dengan alur penelitian, yaitu siapkan data, bentuk dan warnai graf, lalu susun laporan.

---

## 2. Inti yang wajib tersampaikan

Ini bagian paling menentukan. Kalau waktu terbatas, sampaikan hanya ini.

> Dosen D3 mengampu tiga mata kuliah, yaitu MK3, MK7, dan MK10. Satu dosen tidak mungkin mengajar dua kelas pada jam yang sama. Jadi ketiga pasangan mata kuliah itu tidak boleh dijadwalkan bersamaan. Dari situ terbentuk tiga sisi, yaitu MK3-MK7, MK3-MK10, dan MK7-MK10. Tiga simpul yang saling terhubung seperti ini disebut segitiga. Segitiga membutuhkan tiga warna berbeda, jadi jumlah warna tidak mungkin kurang dari tiga.

Kalau dosen bertanya "kok tiga", jawab:

> Karena MK3, MK7, dan MK10 saling berkonflik, ketiganya harus berada di tiga kelompok berbeda.

---

## 3. Peta menu ke konsep penelitian

| Menu | Konsep |
|---|---|
| Mata Kuliah | Simpul V |
| Dosen | Aturan pembentuk sisi E |
| Graf Konflik | Graf G = (V, E) dan derajat |
| Welch Powell | Algoritma dan jejak langkah |
| Hasil Pengelompokan | Kelompok warna dan bilangan kromatik |
| Laporan | Dokumentasi hasil |

Kalau dosen paham tabel ini, sisanya cukup demo.

---

## 4. Penjelasan per halaman

### 4.1 Dashboard

**Isi:** jumlah mata kuliah, dosen, sisi konflik, warna terakhir, panel analisis terakhir, dan kesiapan data.

> Dashboard menampilkan ringkasan. Terlihat sepuluh mata kuliah, enam dosen, lima sisi konflik, dan tiga warna dari analisis terakhir. Ada juga panel kesiapan data untuk memastikan semua mata kuliah sudah punya dosen sebelum analisis dijalankan.

**Tunjuk:** angka 5 sisi dan 3 warna.

### 4.2 Mata Kuliah

**Isi:** tabel kode, nama, SKS, dan dosen pengampu. Bisa tambah, ubah, hapus.

> Halaman ini sumber data simpul. Setiap mata kuliah punya kode, SKS, dan dosen pengampu. SKS dipakai sebagai pemecah seri ketika dua simpul derajatnya sama.

**Tunjuk:** MK3 dengan 3 SKS dan MK7 dengan 1 SKS. Di situ alasan MK7 jatuh ke warna ketiga.

### 4.3 Dosen

**Isi:** daftar dosen beserta mata kuliah yang diampu.

> Halaman ini sumber data sisi. Kalau satu dosen mengampu beberapa mata kuliah, pasangan mata kuliah itu otomatis terhubung. Contohnya D3 mengampu MK3, MK7, dan MK10, sehingga muncul tiga sisi sekaligus.

**Tunjuk:** baris D3 yang berisi tiga mata kuliah. Ini akar dari segitiga.

### 4.4 Graf Konflik

**Isi:** kanvas graf, detail simpul, daftar sisi, dan derajat simpul.

> Di sini grafnya terlihat: sepuluh simpul dan lima sisi. Panel kanan menampilkan detail simpul, daftar sisi beserta dosen penyebabnya, dan derajat tiap simpul. Dari panel ini terlihat MK3, MK7, dan MK10 masing-masing berderajat 2 dan membentuk segitiga.

**Tunjuk:** daftar sisi yang memuat MK3-MK7, MK3-MK10, dan MK7-MK10.

Halaman ini yang paling penting untuk membuktikan bahwa sisi MK7-MK10 benar-benar ada. Sisi itulah yang terlewat pada perhitungan manual sebelumnya.

### 4.5 Welch Powell

**Isi:** pengaturan proses, tombol jalankan, ringkasan, pemutar langkah, rel tahap, dan tabel urutan serta warna.

> Halaman ini menjalankan algoritmanya. Aturan pemecah seri bisa dipilih. Setelah dijalankan, muncul ringkasan dan pemutar langkah. Rel tahap menunjukkan lima tahap, yaitu pembentukan graf, perhitungan derajat, pengurutan simpul, pewarnaan, dan validasi.

**Tunjuk:** klik tahap **Pewarnaan**, lalu **Berikutnya** sampai langkah 6. Di situ MK10 dan MK7 dilewati karena bertetangga dengan MK3.

Penutupnya:

> Langkah ini yang membuktikan ketiganya tidak bisa satu warna.

### 4.6 Hasil Pengelompokan

**Isi:** kelompok warna, anggota, jumlah, total SKS, validasi, dan status optimal.

> Halaman ini hasil akhirnya. Terbentuk tiga kelompok dengan total 20 SKS. Statusnya valid karena seluruh sisi memenuhi aturan, dan optimal karena jumlah warna sama dengan batas bawah. Aplikasi juga menegaskan bahwa kelompok ini bukan jadwal hari, jam, atau ruang.

**Tunjuk:** total SKS 20 dan badge optimal.

### 4.7 Laporan

**Isi:** laporan A4 berisi identitas, data, graf, derajat, urutan, kelompok, validasi, optimalitas, dan batasan. Ada tombol cetak dan unduh CSV.

> Halaman ini menyusun laporan dari snapshot hasil analisis. Jadi kalau data mata kuliah diubah setelahnya, laporan yang sudah dibuat tidak ikut berubah. Laporan bisa dicetak A4 atau diunduh sebagai CSV.

**Tunjuk:** bagian validasi dan optimalitas di laporan.

### 4.8 Pengaturan

**Isi:** aturan pemecah seri, data kelas, dan semester.

> Pengaturan menyimpan aturan pemecah seri serta data kelas dan semester. Aturan inilah yang menentukan urutan saat derajat simpul sama, yaitu derajat menurun, lalu SKS menurun, lalu kode menaik.

**Tunjuk:** pilihan aturan pemecah seri.

### 4.9 Bilah atas

Sebut sekali di awal:

> Di bagian atas ada pemilih kelas dan semester. Semua halaman mengikuti pilihan itu, jadi data yang tampil selalu untuk Kelas D semester ganjil.

---

## 5. Alur demo dua menit

Kalau waktu sangat terbatas, cukup lima halaman ini.

1. **Dashboard:** sebut 10 simpul, 5 sisi, 3 warna.
2. **Dosen:** tunjukkan D3 mengampu tiga mata kuliah.
3. **Graf Konflik:** tunjukkan tiga sisi yang membentuk segitiga.
4. **Welch Powell:** jalankan analisis, lalu tunjukkan langkah 6.
5. **Hasil Pengelompokan:** tunjukkan tiga kelompok dan status optimal.

Mata Kuliah, Laporan, dan Pengaturan cukup disebut kalau ditanya.

## 6. Alur demo tujuh menit

1. Dashboard: ringkasan dan kesiapan data.
2. Mata Kuliah: tunjukkan SKS sebagai pemecah seri.
3. Dosen: tunjukkan D3 dengan tiga mata kuliah.
4. Graf Konflik: tunjukkan simpul, sisi, dan derajat.
5. Welch Powell: jalankan, lalu telusuri langkah 1 sampai 6.
6. Hasil Pengelompokan: tunjukkan kelompok, total SKS, validasi, optimalitas.
7. Laporan: tunjukkan halaman cetak dan tombol CSV.

---

## 7. Hasil yang harus disebut

| Aspek | Nilai |
|---|---|
| Simpul | 10 |
| Sisi | 5 |
| Derajat MK3, MK7, MK10 | 2, 2, 2 |
| Warna | 3 |
| Total SKS | 20 |
| Batas bawah | 3 |
| Status | Valid dan optimal |
| Clique | MK3, MK7, MK10 |

Susunan kelompok:

| Warna | Mata kuliah | Total SKS |
|---|---|---|
| 1 | MK1, MK2, MK3, MK4, MK5, MK6 | 13 |
| 2 | MK8, MK9, MK10 | 6 |
| 3 | MK7 | 1 |

---

## 8. Pertanyaan yang kemungkinan muncul

**Kenapa sebelumnya dua warna?**

> Ada satu sisi yang terlewat, yaitu MK7-MK10. Akibatnya MK7 dan MK10 dianggap tidak berkonflik dan dimasukkan ke kelompok yang sama. Padahal keduanya diampu D3.

**Kalau dua warna, apa masalahnya?**

> D3 akan mengajar dua kelas pada jam yang sama. Itu tidak mungkin.

**Kenapa MK7 sendirian di warna 3?**

> Karena MK7 hanya 1 SKS. Saat derajat sama, urutan memakai SKS menurun. MK10 yang 2 SKS didahulukan, sehingga MK7 tersisa dan mendapat warna ketiga. Hasilnya tetap tiga warna.

**Apakah Welch-Powell selalu menghasilkan jumlah warna minimum?**

> Tidak. Welch-Powell adalah algoritma heuristik. Di kasus ini optimal karena ada segitiga yang menetapkan batas bawah tiga, dan hasilnya juga tiga.

**Ruang kok tidak dipakai?**

> Ruang sudah didata, tetapi belum dijadikan kendala pada model. Kalau ruang dimasukkan, grafnya berubah dan hasilnya belum tentu tiga warna. Itu kami tulis sebagai saran penelitian berikutnya.

**Tabel jadwal itu keluaran algoritma?**

> Bukan. Itu usulan penempatan setelah kelompok terbentuk. Algoritma hanya menghasilkan kelompok warna.

**Aplikasinya untuk apa kalau perhitungannya bisa manual?**

> Untuk memastikan tidak ada sisi yang terlewat, menelusuri langkah, dan menyusun laporan. Kesalahan hitung manual sebelumnya justru terjadi karena satu sisi terlewat.

**Kenapa memakai SKS dalam pengurutan, padahal Welch-Powell hanya memakai derajat?**

> Welch-Powell asli hanya memakai derajat. Kami menambahkan SKS sebagai pemecah seri agar urutan tidak bergantung pada urutan data. Ini kami tulis eksplisit di laporan, dan hasilnya tetap tiga warna.

---

## 9. Kalimat yang sebaiknya dihindari

1. Jangan bilang "perhitungan teman saya salah". Bilang "perhitungan manual sebelumnya kurang satu sisi, yaitu MK7-MK10".
2. Jangan bilang "aplikasi menentukan jadwal". Bilang "aplikasi mengelompokkan mata kuliah".
3. Jangan bilang "Welch-Powell selalu optimal". Bilang "optimal untuk graf ini karena ada segitiga".
4. Jangan bilang "ruang tidak penting". Bilang "belum dimodelkan pada penelitian ini".
5. Jangan menjelaskan React, Express, atau PostgreSQL kecuali ditanya. Fokus ke metode dan hasil.

---

## 10. Persiapan teknis

1. Jalankan aplikasi dari folder `E:\ClassPlan`.

```powershell
npm run dev
```

2. Buka http://localhost:5173.
3. Masuk dengan akun demo.
4. Pastikan kelas dan semester sudah terpilih.
5. Jalankan analisis sekali sebelum presentasi agar halaman Hasil dan Laporan sudah terisi.

Kalau hanya tampilan yang mati:

```powershell
npm run dev -w client
```

---

## 11. Checklist sebelum presentasi

- [ ] Aplikasi menyala dan bisa dibuka.
- [ ] Sudah masuk dengan akun demo.
- [ ] Dashboard menampilkan 5 sisi dan 3 warna.
- [ ] Halaman Graf Konflik menampilkan 5 sisi.
- [ ] Analisis sudah pernah dijalankan.
- [ ] Halaman Hasil menampilkan badge optimal.
- [ ] Halaman Laporan bisa dicetak.
- [ ] Tiga kalimat inti sudah dihafal: sepuluh simpul, lima sisi, tiga warna.
