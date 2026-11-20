# ClassPlan: Arah Desain

Sumber arah: `ClassPlan.md` bagian 10 (dashboard akademik bersih, latar terang, sidebar navy, aksen biru, tanpa dekorasi berlebih). Nilai token di bawah adalah penjabaran teknis dari arah tersebut, bukan arah baru.

Dial: ENERGY 1 / RHYTHM 2 / MOTION 1

- ENERGY 1: tenang, institusional, tidak berteriak.
- RHYTHM 2: sebagian besar halaman seragam dan mudah diprediksi, tetapi kanvas graf dan pemutar langkah sengaja memecah pola karena isinya berbeda sifat.
- MOTION 1: transisi hover, fokus, dan perubahan langkah saja. Tanpa animasi masuk, tanpa denyut berulang.

Fokus per layar: satu elemen yang jelas paling penting. Pada Dashboard itu panel run terakhir. Pada Analisis itu kanvas graf. Pada Hasil itu daftar kelompok.

---

## 1. Warna

| Token | Nilai | Pemakaian |
|-------|-------|-----------|
| `--bg` | `#F6F7F9` | Latar area kerja |
| `--surface` | `#FFFFFF` | Kartu, tabel, modal |
| `--navy` | `#0F1D36` | Sidebar, judul laporan |
| `--nav-text` | `#C3CEDF` | Teks navigasi (10.7:1 pada navy) |
| `--text` | `#0F172A` | Teks utama |
| `--text-muted` | `#55617A` | Teks sekunder (6.2:1 pada putih) |
| `--border` | `#E1E5EC` | Garis tabel, pemisah |
| `--accent` | `#1D4ED8` | Aksi utama, tautan, state aktif |
| `--accent-soft` | `#E8EFFC` | Latar chip dan baris terpilih |
| `--focus` | `#2563EB` | Cincin fokus 2px + offset 2px |
| `--success` | `#15803D` | Validasi lolos |
| `--warning` | `#B45309` | Peringatan data belum lengkap |
| `--danger` | `#B91C1C` | Hapus, konflik tidak valid |

Palet inti: navy, netral, satu aksen biru. Warna semantik hanya muncul pada badge dan banner, tidak pada tombol utama.

Warna kelompok adalah palet data, bukan palet merek: delapan hues dengan pasangan `tint` (latar), `ink` (teks), dan `line` (garis). Setiap kelompok selalu menampilkan nomor, sehingga warna bukan satu-satunya pembeda.

---

## 2. Tipografi

- Teks: IBM Plex Sans, bobot 400, 500, 600.
- Kode: IBM Plex Mono, bobot 500.

Alasan: Plex Sans punya karakter institusional dan angka yang jelas untuk tabel akademik. Plex Mono dipakai hanya untuk kode mata kuliah dan matriks ketetanggaan, karena kode dibaca menurun dan butuh lebar tetap.

| Peran | Ukuran / tinggi baris | Bobot |
|-------|----------------------|-------|
| Judul halaman | 24 / 32 | 600 |
| Judul bagian | 18 / 28 | 600 |
| Subjudul kartu | 14 / 20 | 600 |
| Body | 14 / 22 | 400 |
| Tabel | 14 / 20 | 400 |
| Label form | 13 / 18 | 500 |
| Keterangan | 13 / 20 | 400 |
| Angka tabel | 14 / 20, `tabular-nums` | 500 |

Tidak memakai huruf mono untuk judul, dan tidak memakai huruf kapital berjarak lebar untuk label bagian.

---

## 3. Bentuk, bayangan, jarak

- Radius: input dan tombol 6px, kartu 10px, modal 12px, badge 4px.
- Kartu memakai garis 1px, bukan bayangan.
- Bayangan hanya untuk modal, dropdown, dan toast: `0 10px 30px rgba(15, 23, 42, 0.12)`.
- Skala jarak: 4, 8, 12, 16, 24, 32, 48.
- Tinggi baris tabel 48px, padding sel 12px 16px.
- Lebar sidebar 248px, area konten maksimum 1440px dengan padding 32px.

Tidak ada gradient, glow, kaca, pola latar, atau garis aksen dekoratif di tepi kartu.

---

## 4. Komponen

**Tombol**
- Primer: latar `--accent`, teks putih, satu per layar sebagai aksi utama.
- Sekunder: latar putih, garis `--border`.
- Hapus: teks `--danger`, garis `--danger` hanya pada dialog konfirmasi.
- Tanpa ikon panah dekoratif.

**Tabel**
- Header rata kiri, huruf 13px, warna `--text-muted`.
- Kolom kode memakai mono dan tetap terlihat saat tabel digulir horizontal.
- Aksi baris berupa teks "Ubah" dan "Hapus", bukan menu tiga titik.
- Baris kosong tidak diisi data palsu.

**Form**
- Label di atas field, wajib ditandai teks "(wajib)".
- Pesan galat di bawah field, warna `--danger`, disertai `aria-describedby`.
- Pencarian memakai debounce 300ms.

**Modal**
- Fokus masuk ke field pertama, Escape menutup, fokus kembali ke pemicu.
- Tidak dipakai untuk laporan atau konten panjang.

**Badge status**
- Valid: latar `#EAF5EE`, teks `#14532D`.
- Belum lengkap: latar `#FDF3E7`, teks `#7C2D12`.
- Tidak valid: latar `#FDECEC`, teks `#7F1D1D`.
- Bentuk persegi radius 4px, bukan kapsul.

**Graf**
- Node: persegi radius 8px, garis 1.5px warna kelompok, latar tint, teks kode mono 13px dan nama 12px.
- Node fokus memakai cincin `--focus`, bukan glow.
- Sisi: 1.5px `#94A3B8`, sisi terpilih 2px `--accent`.
- Simpul terisolasi tetap ditampilkan dengan derajat 0.
- Legenda menampilkan nomor kelompok dan jumlah anggota.

**Pengelompokan**
- Nomor kelompok ditampilkan sebagai chip persegi, bukan lingkaran berwarna saja.
- Total SKS diberi label "total SKS kelompok" agar tidak disalahartikan sebagai beban waktu.

---

## 5. Nada teks

- Bahasa Indonesia, kalimat pendek, tanpa istilah pemasaran.
- Kata "kelompok" untuk hasil pewarnaan. Kata "jadwal" hanya untuk fitur penempatan waktu yang belum ada.
- Tombol menyebut aksi sebenarnya: "Jalankan analisis", "Simpan mata kuliah", "Cetak laporan".
- Tidak memakai em dash, tanda seru, atau emoji.
- Angka pada Dashboard selalu berasal dari data nyata. Bila data kosong, tampilkan tanda hubung beserta penjelasan, bukan angka contoh.

---

## 6. Yang dihindari

- Deretan empat kartu statistik identik sebagai isi utama Dashboard.
- Bento grid, gradient biru ke ungu, glow, kaca, pola grid.
- Semua elemen berbentuk kapsul.
- Ikon generik tanpa kaitan dengan konteks (sparkle, bintang, kilat).
- Tombol atau tautan yang belum punya tujuan.
- Grafik hiasan tanpa pertanyaan yang dijawab.
- Data contoh yang menyerupai data nyata di dalam tabel atau form kosong.
