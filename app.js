const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const app = express();

// Koneksi ke MongoDB menggunakan Mongoose
mongoose.connect("mongodb+srv://kulikomiss:hPrLbvYmS89yDYuu@rboyz.s0ymm.mongodb.net/?retryWrites=true&w=majority&appName=rboyz", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Definisikan model untuk Galeri
const gallerySchema = new mongoose.Schema({
  username: { type: String, required: true },
  caption: { type: String, required: true },
  pfpUrl: { type: String, required: true },
  imgUrl: { type: String, required: true },
});

const Gallery = mongoose.model('Gallery', gallerySchema);

// Definisikan model untuk addmem
const addmemSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  pfp: { type: String, required: true }, // URL foto profil
});

const AddMem = mongoose.model('AddMem', addmemSchema);


// Middleware untuk file statis
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi Multer untuk upload file (gunakan /tmp di Vercel)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '/tmp'; // Simpan di direktori sementara /tmp
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
          <img src="/tmp/${image.originalName}" alt="${image.filename}" style="width:200px;" />
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

app.get('/collection', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'collection.html'));
});

app.get('/member', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'member.html'));
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

// Rute untuk mendapatkan daftar member
app.get('/api/members', async (req, res) => {
  try {
    const members = await AddMem.find();
    res.json(members);
  } catch (err) {
    res.status(500).send('Failed to fetch members');
  }
});

// Rute upload untuk mengunggah gambar
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { username, caption, pfpUrl, imgUrl } = req.body;

    // Simpan data gambar ke database
    const newImage = new Gallery({ username, caption, pfpUrl, imgUrl });

    await newImage.save();
    console.log('Uploaded image:', newImage);

    // File dapat diunggah ke storage cloud jika diperlukan di sini.
    res.redirect('/');
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).send('Something went wrong!');
  }
});
// Rute untuk menambahkan member ke koleksi addmem
app.post('/addmem', async (req, res) => {
  try {
    const { username, name, pfp } = req.body;

    // Validasi input
    if (!username || !name || !pfp) {
      return res.status(400).send('All fields are required: username, name, and pfp');
    }

    // Simpan data ke koleksi addmem
    const newMember = new AddMem({ username, name, pfp });
    await newMember.save();

    console.log('Added new member:', newMember);
    res.redirect('/member');
  } catch (err) {
    console.error('Error adding member:', err.message);
    res.status(500).send('Failed to add member');
  }
});

// Jalankan server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;
