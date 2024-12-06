const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware untuk parsing data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk file statis
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('/tmp')) {
      console.error('Temporary directory "/tmp" does not exist.');
      throw new Error('Temporary directory "/tmp" unavailable.');
    }
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Galeri JSON
const galleryPath = '/tmp/gallery.json';
const getGallery = () => {
  if (!fs.existsSync(galleryPath)) {
    console.log('Gallery JSON not found. Creating a new one...');
    fs.writeFileSync(galleryPath, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(galleryPath));
};

// Rute untuk file gambar
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join('/tmp', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Rute utama
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

// Rute admin/upload
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Rute untuk upload file
app.post('/upload', upload.single('image'), (req, res, next) => {
  try {
    const gallery = getGallery();
    const { title } = req.body;

    if (!req.file) {
      throw new Error('File upload failed: No file received.');
    }

    const newImage = {
      id: Date.now(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      title: title || 'Untitled',
    };
    gallery.push(newImage);

    fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
    res.redirect('/');
  } catch (err) {
    console.error('Upload error:', err.message);
    next(err);
  }
});

// Middleware logging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Middleware error handler
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  res.status(500).send('Something went wrong!');
});

// Ekspor aplikasi
module.exports = app;
