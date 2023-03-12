const axios = require('axios');
const cheerio = require('cheerio');

const getMangaDetails = async (url) => {
  try {
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const reader = $('#rdr-main').length;

    if (reader) {
      return 'reader';
    }

    const title = $('h1').text();
    const cover = $('img').attr('src');

    return { title, cover };
  } catch (error) {
    return null;
  }
};

const getLatestChapter = async (url) => {
  const cubariUrl = 'https://cubari.moe';
  let latestChapterUrl = '';
  let latestChapter = 0;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    latestChapterUrl =
      cubariUrl + $('#chapterTable > tr').first().find('a').prop('href');
    latestChapter = +$('#chapterTable > tr').first().attr('data-chapter');

    return { latestChapterUrl, latestChapter };
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  getMangaDetails,
  getLatestChapter,
};
