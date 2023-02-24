const mongoose = require('mongoose');

const MangaSchema = new mongoose.Schema({
  title: {
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
  source_id: {
    type: String,
    required: true,
    unique: true,
  },
  textChannelId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Manga', MangaSchema);
