const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const app = express();

// Koneksi ke MongoDB menggunakan Mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Definisikan model untuk Galeri
const gallerySchema = new mongoose.Schema({
  title: String,
  filename: String,
  originalName: String,
  uploadedAt: { type: Date, default: Date.now },
});

const Gallery = mongoose.model('Gallery', gallerySchema);

// Middleware untuk file statis
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Rute root untuk menampilkan galeri
app.get('/', async (req, res) => {
  try {
    const gallery = await Gallery.find();
    let html = '<h1>Gallery</h1><div>';
    gallery.forEach((image) => {
      html += `
        <div>
          <img src="/uploads/${image.filename}" alt="${image.originalName}" style="width:200px;" />
          <p>${image.title}</p>
        </div>
      `;
    });
    html += '</div><a href="/admin">Upload More</a>';
    res.send(html);
  } catch (err) {
    res.status(500).send('Error fetching gallery');
  }
});

// Rute untuk halaman admin/upload
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

// Rute untuk galeri
app.get('/gallery', async (req, res) => {
  try {
    const gallery = await Gallery.find();
    res.json(gallery);
  } catch (err) {
    res.status(500).send('Error fetching gallery');
  }
});

// Rute upload untuk mengunggah gambar
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { title } = req.body;
    const newImage = new Gallery({
      title: title || 'Untitled',
      filename: req.file.filename,
      originalName: req.file.originalname,
    });

    await newImage.save();
    console.log('Uploaded image:', newImage);
    res.redirect('/');
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).send('Something went wrong!');
  }
});

// Jalankan server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;
