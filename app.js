const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Load data dari JSON
const galleryPath = './data/gallery.json';
const getGallery = () => JSON.parse(fs.readFileSync(galleryPath));

// Routes
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


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
