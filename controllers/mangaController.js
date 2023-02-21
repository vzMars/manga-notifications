const axios = require('axios');

const baseUrl = 'https://api.mangadex.org';

const searchManga = async (title) => {
  const url = `${baseUrl}/manga/?title=${title}&order[relevance]=desc`;
  try {
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

const getMangaDetails = async (id) => {
  const url = `${baseUrl}/manga/${id}?includes[]=author&includes[]=cover_art`;
  try {
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  searchManga,
  getMangaDetails,
};
