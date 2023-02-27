const axios = require('axios');
const cheerio = require('cheerio');

const getMangaDetails = async (url) => {
  try {
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);
    const title = $('h1').text();
    const cover = $('img').attr('src');

    return { title, cover };
  } catch (error) {
    return null;
  }
};

const getLatestChapter = async (url) => {};

module.exports = {
  getMangaDetails,
  getLatestChapter,
};
