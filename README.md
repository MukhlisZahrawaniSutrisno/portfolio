# Mukhlis Zahrawani Sutrisno — Frontend & UI/UX Portfolio

Portfolio React + TypeScript + Vite dengan palet hitam/putih, hero tipografi, objek CSS 3D interaktif, animasi Motion, showcase responsif, filter proyek, dan dialog studi kasus.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5173 di browser. Biarkan terminal tetap berjalan; tekan Ctrl+C untuk menghentikan server.

Pada Windows PowerShell dengan pembatasan skrip, gunakan:

```powershell
cd "C:\PROJECT\MY PORTOFOLIO"
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Buka http://127.0.0.1:5173. Jika port sudah digunakan, hentikan server lama atau pilih port lain.

## Build & pengujian

```bash
npm run build
npx playwright install chromium
npm test
```

Pengujian browser mencakup desktop/mobile, filter proyek, dialog dan keyboard, formulir kontak, reduced motion, serta overflow horizontal, identitas lengkap, kategori skills, kontak, dan perubahan preferensi reduced motion tanpa reload.

Belum ada script lint yang dikonfigurasi; `npm run build` menjalankan pemeriksaan TypeScript sebelum build produksi.

## Personalisasi

- Opening jam ada di `src/components/ClockOpening.tsx` dan `clock-opening.css`, terpisah dari layout portfolio. Opening hanya menampilkan dial Romawi tanpa nama atau tombol, dengan reveal angka dan jejak jarum tipis. Dial memakai `ClockFace.tsx` bersama jam Surabaya. Jarum mundur selama 1,8 detik, bergerak maju saat selesai atau dilewati, lalu opening memudar. Escape, Tab, scroll, dan swipe dapat melewatinya; reduced motion, deep link, dan reload langsung membuka halaman utama. Tes arah jarum memakai waktu virtual agar tetap akurat di browser headless.
- Selected Work sementara disembunyikan. Ubah `showSelectedWork` menjadi `true` di `src/content.ts` untuk memulihkan showcase, tautan Work, dan tombol hero; kode proyek serta studi kasus tetap disimpan.
- Pilih Light atau Dark melalui tombol tema di navbar. Pilihan tersimpan di browser; preferensi System lama kembali ke Light. Token warna ada di `src/theme.css`.
- Tujuh adegan musim dipilih acak setiap 5 detik tanpa mengulang musim yang sedang aktif. `SeasonEffects.tsx` mengatur rotasi/pause; `SeasonScene.tsx` dan `season-scene.css` menggambar atmosfer berlapis; `SeasonDetails.tsx` dan `season-details.css` menempatkan detail di judul dan area skills. Tab tersembunyi menjeda timer serta animasi, dan reduced motion menonaktifkan seluruh efek.
- Ubah nama, lokasi, fokus, stack, skills, availability, dan kontak di `src/content.ts`.
- GitHub menggunakan URL repository dari remote origin yang sudah ada. Gmail, LinkedIn, dan Resume ditampilkan sebagai belum tersedia sampai diisi. Tidak ada URL personal yang dibuat-buat.
- Kategori Databases sengaja kosong karena belum ada data database di proyek. Isi dengan pengalaman yang sebenarnya.
- Isi `profile.email` agar formulir kontak dapat membuka draft di aplikasi email. Formulir tidak mengirim otomatis dan tidak memiliki backend.
- Ubah proyek dan studi kasus di `src/components/Work.tsx`. Forma dan Aesop adalah proyek konsep; ganti dengan karya dan hasil nyata sebelum publikasi.
- Ubah teks utama di `src/App.tsx` serta judul/deskripsi metadata di `index.html`.
- Ganti font atau token warna di `src/styles.css`. Font Google memiliki fallback lokal bila jaringan tidak tersedia.

Tidak membutuhkan API key. Mockup proyek, objek hero, dedaunan, bunga, dan kilat dibuat dengan CSS/SVG lokal. Animasi menghormati `prefers-reduced-motion`, termasuk saat preferensi diubah ketika halaman terbuka. Hero memakai animasi transform singkat dan interaksi pointer dengan Motion values. Adegan musim memakai lapisan hujan, percikan, awan, cahaya, serta gerak organik; lapisan tambahan dikurangi di mobile. Rotasi tidak menggunakan loop render JavaScript per frame, dan semua dekorasi mengabaikan pointer agar navigasi tetap berfungsi.
