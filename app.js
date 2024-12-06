const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware untuk parsing data JSON dan URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk file statis
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Gunakan '/tmp' untuk penyimpanan sementara di Vercel
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Fungsi untuk mendapatkan data galeri
const galleryPath = '/tmp/gallery.json';
const getGallery = () => {
  if (fs.existsSync(galleryPath)) {
    return JSON.parse(fs.readFileSync(galleryPath));
  }
  return []; // Jika file tidak ada, kembalikan array kosong
};

// Rute root untuk menampilkan halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rute untuk halaman admin/upload
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Rute untuk mendapatkan data galeri
app.get('/gallery', (req, res) => {
  const gallery = getGallery();
  res.json(gallery);
});

// Rute untuk upload file
app.post('/upload', upload.single('image'), (req, res) => {
  const gallery = getGallery();
  const { title } = req.body;

  // Tambahkan data baru ke galeri
  const newImage = {
    id: Date.now(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    title: title || 'Untitled',
  };
  gallery.push(newImage);

  // Simpan galeri ke file JSON
  fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
  res.redirect('/');
});

// Middleware untuk logging dan debugging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Middleware untuk menangani error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Ekspor aplikasi untuk Vercel
module.exports = app;
