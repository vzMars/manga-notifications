const axios = require('axios');
const cheerio = require('cheerio');
const baseUrl = 'https://onepiecechapters.com/projects';

const searchManga = async () => {
  try {
    const response = await axios.get(baseUrl);

    const $ = cheerio.load(response.data);

    const results = [];
    $('.mb-3.text-white.text-lg.font-bold').each((i, elem) => {
      results.push({
        title: $(elem).text(),
        link: `https://onepiecechapters.com${$(elem).prop('href')}`,
      });
    });

    return results;
  } catch (error) {
    console.log(error);
  }
};

const getMangaDetails = async (url) => {
  try {
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const title = $('h1').text();
    const description = $('.leading-6.my-3').text();
    const cover = $('.flex.items-center.justify-center')
      .children('img')
      .attr('src');

    return { title, description, cover };
  } catch (error) {
    console.log(error);
  }
};

const getLatestChapter = async (url) => {
  const tcbUrl = 'https://onepiecechapters.com';
  let latestChapterUrl = '';
  let latestChapter = 0;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const latestChapterArr = `${$(
      '.block.border.border-border.bg-card.mb-3.p-3.rounded'
    )
      .first()
      .children()
      .first()
      .text()}`.split(' ');
    latestChapterUrl =
      tcbUrl +
      $('.block.border.border-border.bg-card.mb-3.p-3.rounded')
        .first()
        .prop('href');
    latestChapter = +latestChapterArr[latestChapterArr.length - 1];

    return { latestChapterUrl, latestChapter };
  } catch (error) {
    console.log(`error came from ${url}`);
    console.log(error.message);
  }
};

module.exports = {
  searchManga,
  getMangaDetails,
  getLatestChapter,
};
