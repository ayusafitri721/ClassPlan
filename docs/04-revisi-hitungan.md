# Revisi Bagian Hitungan Laporan

Berkas ini hanya berisi bagian hitungan, mulai dari Tabel 3.1 sampai kalimat bilangan kromatik. Bagian awal laporan tidak perlu diubah. Nomor tabel dan subbab dapat disesuaikan dengan templat.

## Inti koreksi

1. D3 mengampu MK3, MK7, dan MK10, jadi ketiga pasangan mata kuliah tersebut saling berkonflik.
2. Sisi MK7-MK10 wajib ada. Sisi ini yang sebelumnya terlewat.
3. Derajat MK7 dan MK10 adalah 2, bukan 1.
4. Hasilnya 3 warna, bukan 2.
5. Nama mata kuliah diseragamkan dengan daftar resmi prodi.
6. Urutan memakai SKS sebagai pemecah seri, sama seperti aplikasi ClassPlan.

---

## Tabel 3.1 Nama Mata Kuliah, SKS, dan Kode Mata Kuliah

| No | Mata Kuliah | SKS | Kode |
|---|---|---|---|
| 1 | Pendidikan Agama | 2 | MK1 |
| 2 | Pancasila | 2 | MK2 |
| 3 | Matematika Diskrit | 3 | MK3 |
| 4 | Pendidikan Bela Negara | 2 | MK4 |
| 5 | Dasar Pemrograman | 2 | MK5 |
| 6 | Konsep Basis Data | 2 | MK6 |
| 7 | Struktur Data | 1 | MK7 |
| 8 | Praktikum Dasar Pemrograman | 2 | MK8 |
| 9 | Praktikum Konsep Basis Data | 2 | MK9 |
| 10 | Praktikum Struktur Data | 2 | MK10 |

Catatan: kolom JP pada tabel lama tidak ada datanya pada daftar yang dipakai, jadi dihilangkan. Kolom SKS dipakai sebagai pemecah seri saat dua simpul memiliki derajat yang sama.

## Tabel 3.2 Nama dan Kode Dosen Beserta Mata Kuliah yang Diampu

| Kode Dosen | Mata Kuliah |
|---|---|
| D1 | MK1 |
| D2 | MK2 |
| D3 | MK3, MK7, MK10 |
| D4 | MK4 |
| D5 | MK5, MK8 |
| D6 | MK6, MK9 |

---

## Tabel Sisi Graf Konflik

| No | Sisi | Dosen | Keterangan |
|---|---|---|---|
| 1 | MK3 - MK7 | D3 | D3 mengampu keduanya |
| 2 | MK3 - MK10 | D3 | D3 mengampu keduanya |
| 3 | MK7 - MK10 | D3 | D3 mengampu keduanya |
| 4 | MK5 - MK8 | D5 | D5 mengampu keduanya |
| 5 | MK6 - MK9 | D6 | D6 mengampu keduanya |

Sisi nomor 3 sering terlewat pada perhitungan manual. Padahal, jika D3 mengampu MK3, MK7, dan MK10, maka ketiga pasangan mata kuliah tersebut saling berkonflik. Akibatnya MK3, MK7, dan MK10 membentuk segitiga pada graf.

---

## Derajat Simpul

```text
d(MK1)  = 0
d(MK2)  = 0
d(MK3)  = 2
d(MK4)  = 0
d(MK5)  = 1
d(MK6)  = 1
d(MK7)  = 2
d(MK8)  = 1
d(MK9)  = 1
d(MK10) = 2
```

Jumlah seluruh derajat adalah 10. Nilai ini sama dengan dua kali jumlah sisi, yaitu 2 x 5 = 10, sehingga perhitungan derajat konsisten dengan jumlah sisi pada graf.

---

## Urutan dan Hasil Pewarnaan

Urutan simpul:

```text
MK3, MK10, MK7, MK5, MK6, MK8, MK9, MK1, MK2, MK4
```

Aturan pemecah seri: derajat menurun, lalu SKS menurun, lalu kode menaik. MK10 didahulukan dari MK7 karena keduanya berderajat 2, tetapi MK10 memiliki 2 SKS sedangkan MK7 memiliki 1 SKS.

| No | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Kode | MK3 | MK10 | MK7 | MK5 | MK6 | MK8 | MK9 | MK1 | MK2 | MK4 |
| Derajat | 2 | 2 | 2 | 1 | 1 | 1 | 1 | 0 | 0 | 0 |
| SKS | 3 | 2 | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| Warna | 1 | 2 | 3 | 1 | 1 | 2 | 2 | 1 | 1 | 1 |

### Proses pewarnaan

1. **Warna 1** dibuka pada MK3.
   - MK10 dan MK7 dilewati karena bertetangga dengan MK3.
   - MK5 dan MK6 diberi warna 1.
   - MK8 dilewati karena bertetangga dengan MK5.
   - MK9 dilewati karena bertetangga dengan MK6.
   - MK1, MK2, dan MK4 diberi warna 1.
2. **Warna 2** dibuka pada MK10.
   - MK7 dilewati karena bertetangga dengan MK10.
   - MK8 dan MK9 diberi warna 2 karena tidak bertetangga dengan MK10.
3. **Warna 3** dibuka pada MK7.
   - Semua simpul sudah berwarna, sehingga proses selesai.

---

## Tabel Kelompok Mata Kuliah Berdasarkan Warna

| Warna | Kode Mata Kuliah | Mata Kuliah | Jumlah | Total SKS |
|---|---|---|---|---|
| 1 | MK1, MK2, MK3, MK4, MK5, MK6 | Pendidikan Agama, Pancasila, Matematika Diskrit, Pendidikan Bela Negara, Dasar Pemrograman, Konsep Basis Data | 6 | 13 |
| 2 | MK8, MK9, MK10 | Praktikum Dasar Pemrograman, Praktikum Konsep Basis Data, Praktikum Struktur Data | 3 | 6 |
| 3 | MK7 | Struktur Data | 1 | 1 |

Total SKS: 13 + 6 + 1 = 20, sama dengan jumlah SKS seluruh mata kuliah.

Setiap warna berisi mata kuliah yang tidak saling berkonflik. Sebaliknya, mata kuliah yang berkonflik selalu berada pada warna yang berbeda. MK3, MK7, dan MK10 berada pada tiga warna berbeda karena ketiganya saling bertetangga.

Warna pada tabel ini adalah kelompok mata kuliah yang aman dijalankan pada sesi yang sama, bukan hari atau jam kuliah. Penentuan hari, jam, dan ruang dilakukan pada tahap berikutnya.

---

## Kalimat Bilangan Kromatik

> Karena semua titik sudah diberi warna, proses pewarnaan selesai. Graf memuat segitiga MK3, MK7, dan MK10 karena ketiganya saling bertetangga melalui dosen D3. Segitiga tersebut menetapkan batas bawah tiga warna. Hasil pewarnaan juga menggunakan tiga warna, sehingga bilangan kromatik graf adalah 3. Dengan demikian, hasil pewarnaan pada kasus ini terbukti optimal.

---

## Nama Mata Kuliah yang Perlu Diganti

| Nama lama di dokumen | Nama yang dipakai |
|---|---|
| Agama | Pendidikan Agama |
| Konsep Dasar Pemograman | Dasar Pemrograman |
| Konsep Struktur Data | Struktur Data |
| Praktikum Basis Data | Praktikum Konsep Basis Data |

Perbaiki juga ejaan "Pemograman" menjadi "Pemrograman" dan "Graph Colloring" menjadi "Graph Coloring".

---

## Catatan Kalau Urutan Lama Tetap Dipakai

Kalau tim memilih tetap memakai urutan kolom `MK3, MK5, MK6, MK7, MK8, MK9, MK10, MK1, MK2, MK4` tanpa SKS, hasilnya juga tetap 3 warna, tetapi susunannya berbeda:

| No | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Kode | MK3 | MK5 | MK6 | MK7 | MK8 | MK9 | MK10 | MK1 | MK2 | MK4 |
| Derajat | 2 | 1 | 1 | 2 | 1 | 1 | 2 | 0 | 0 | 0 |
| Warna | 1 | 1 | 1 | 2 | 2 | 2 | 3 | 1 | 1 | 1 |

Pada versi ini warna 3 berisi MK10, bukan MK7. Dua-duanya valid. Yang penting jangan mencampur keduanya. Versi dengan SKS adalah versi yang sama dengan aplikasi.

---

## Checklist

- [ ] Tabel 3.1 sudah memakai nama resmi dan kolom SKS.
- [ ] Derajat MK7 dan MK10 sudah 2.
- [ ] Sisi MK7-MK10 sudah masuk tabel sisi.
- [ ] Urutan simpul dan tabel warna sudah 3 warna.
- [ ] Tabel kelompok sudah sesuai.
- [ ] Kalimat bilangan kromatik sudah menyebut batas bawah 3.
- [ ] Ejaan nama mata kuliah sudah diperbaiki.
