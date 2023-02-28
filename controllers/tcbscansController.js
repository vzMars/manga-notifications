const axios = require('axios');
const cheerio = require('cheerio');
const url = 'https://onepiecechapters.com/projects';

const searchManga = async () => {
  try {
    const response = await axios.get(url);

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

module.exports = {
  searchManga,
};
