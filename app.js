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
    cb(null, '/tmp'); // Gunakan direktori sementara di Vercel
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
  return [];
};

// Rute untuk menyajikan file gambar dari /tmp
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join('/tmp', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Rute root untuk menampilkan halaman utama dengan galeri
app.get('/', (req, res) => {
  const gallery = getGallery();
  let html = '<h1>Gallery</h1><div style="display:flex;flex-wrap:wrap;">';
  gallery.forEach(image => {
    html += `
      <div style="margin:10px;">
        <img src="/uploads/${image.filename}" alt="${image.originalName}" style="width:200px;height:auto;" />
        <p>${image.title || 'Untitled'}</p>
      </div>
    `;
  });
  html += '</div><a href="/admin">Upload More</a>';
  res.send(html);
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

  const newImage = {
    id: Date.now(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    title: title || 'Untitled',
  };
  gallery.push(newImage);

  fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
  res.redirect('/');
});

// Middleware untuk logging
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
