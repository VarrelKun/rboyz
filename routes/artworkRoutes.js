const express = require('express');
const multer = require('multer');
const Artwork = require('../models/Artwork');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Get all artworks
router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find();
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload artwork
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const newArtwork = new Artwork({
      title: req.body.title,
      artist: req.body.artist,
      image: `/uploads/${req.file.filename}`,
    });
    await newArtwork.save();
    res.status(201).json(newArtwork);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
