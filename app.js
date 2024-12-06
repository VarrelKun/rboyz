const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('/tmp'));


const galleryPath = '/tmp/gallery.json';

// Middleware untuk inisialisasi direktori /tmp
const initTmpDir = () => {
  const tmpDir = '/tmp';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
};

// Fungsi untuk mendapatkan galeri
const getGallery = () => {
  initTmpDir();
  if (!fs.existsSync(galleryPath)) {
    fs.writeFileSync(galleryPath, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(galleryPath));
};

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    initTmpDir();
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  const gallery = getGallery();
  let html = '<h1>Gallery</h1><div>';
  gallery.forEach(image => {
    html += `
      <div>
        <img src="/uploads/${image.filename}" alt="${image.originalName}" style="width:200px;" />
        <p>${image.title}</p>
      </div>
    `;
  });
  html += '</div><a href="/admin">Upload More</a>';
  res.send(html);
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.post('/upload', upload.single('image'), (req, res, next) => {
  try {
    console.log('File uploaded:', req.file);
    console.log('Request body:', req.body);

    if (!req.file) {
      throw new Error('No file uploaded');
    }

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
    console.log('Gallery updated:', gallery);
    res.redirect('/');
  } catch (err) {
    console.error('Error in /upload:', err.message);
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error('Error details:', err);
  res.status(500).send('Something went wrong!');
});

module.exports = app;
