const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Middleware untuk file statis
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Gunakan '/tmp' di Vercel untuk penyimpanan sementara
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Load data dari JSON
const galleryPath = './data/gallery.json';
const getGallery = () => JSON.parse(fs.readFileSync(galleryPath));

// Rute root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.get('/gallery', (req, res) => {
  const gallery = getGallery();
  res.json(gallery);
});

app.post('/upload', upload.single('image'), (req, res) => {
  const gallery = getGallery();
  const { title } = req.body;
  const newImage = {
    id: Date.now(),
    filename: req.file.filename,
    originalName: req.body,
  };
  gallery.push(newImage);

  fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
  res.redirect('/');
});


// Jalankan server
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});


module.exports = app;
