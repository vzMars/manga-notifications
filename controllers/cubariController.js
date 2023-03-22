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
    const response = await axios.get(url, {
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
      },
    });
    const $ = cheerio.load(response.data);

    latestChapterUrl =
      cubariUrl + $('#chapterTable > tr').first().find('a').prop('href');
    latestChapter = +$('#chapterTable > tr').first().attr('data-chapter');

    return { latestChapterUrl, latestChapter };
  } catch (error) {
    console.log(`error came from ${url}`);
    console.log(error.message);
  }
};

module.exports = {
  getMangaDetails,
  getLatestChapter,
};
