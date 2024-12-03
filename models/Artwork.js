const mongoose = require('mongoose');

const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  image: { type: String, required: true },
});

module.exports = mongoose.model('Artwork', ArtworkSchema);
