const axios = require('axios');
const baseUrl = 'https://api.mangadex.org';

const searchManga = async (title) => {
  const url = `${baseUrl}/manga/?title=${title}&order[relevance]=desc&includes[]=author`;
  try {
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.log(error);
  }
};

const getMangaDetails = async (id) => {
  const url = `${baseUrl}/manga/${id}?includes[]=cover_art`;
  try {
    const response = await axios.get(url);
    const data = response.data.data;
    const title = data.attributes.title.en;
    const description = data.attributes.description.en
      ? data.attributes.description.en
      : 'Description Unavailable';
    const { fileName } = data.relationships.find(
      (relationship) => relationship.type === 'cover_art'
    ).attributes;

    return { title, description, fileName };
  } catch (error) {
    console.log(error);
  }
};

const getLatestChapter = async (id) => {
  const url = `${baseUrl}/manga/${id}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=1`;
  let latestChapterId = '';
  let latestChapter = 0;
  try {
    const response = await axios.get(url);

    if (response.data.data?.length) {
      latestChapterId = response.data.data[0].id;
      latestChapter = response.data.data[0].attributes.chapter;
    }

    return { latestChapterId, latestChapter };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  searchManga,
  getMangaDetails,
  getLatestChapter,
};
