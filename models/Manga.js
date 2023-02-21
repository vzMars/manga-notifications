const mongoose = require('mongoose');

const MangaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: true,
  },
  latestChapter: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  textChannelID: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Manga', MangaSchema);
