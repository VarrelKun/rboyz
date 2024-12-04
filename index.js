const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));


// Schema and Model
const photoSchema = new mongoose.Schema({
    title: String,
    imagePath: String,
});
const Photo = mongoose.model('Photo', photoSchema);

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Routes
app.get('/', async (req, res) => {
    const photos = await Photo.find();
    res.render('gallery', { photos });
});

app.get('/upload', (req, res) => {
    res.render('upload');
});

app.post('/upload', upload.single('photo'), async (req, res) => {
    const { title } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;
    await Photo.create({ title, imagePath });
    res.redirect('/');
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

