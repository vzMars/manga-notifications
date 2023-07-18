const schedule = require('node-schedule');
const Manga = require('../models/Manga');
const mangadexController = require('../controllers/mangadexController');
const mangaseeController = require('../controllers/mangaseeController');
const cubariController = require('../controllers/cubariController');
const tcbscansController = require('../controllers/tcbscansController');
const { newChapterEmbed } = require('../components/embeds');

const checkChapter = async (client, manga, latestChapter, links) => {
  if (manga.latestChapter < latestChapter) {
    const chapter = {
      title: manga.title,
      cover: manga.cover,
      chapterNumber: latestChapter,
      chapterLink: links.chapterLink,
      seriesLink: links.seriesLink,
    };

    const newChapter = newChapterEmbed(chapter);
    const channel = client.channels.cache.get(manga.textChannelId);

    manga.latestChapter = latestChapter;
    await manga.save();

    channel.send({ embeds: [newChapter] });
  }
};

const getLatestChapters = async (client) => {
  schedule.scheduleJob('*/30 * * * *', async () => {
    try {
      const mangas = await Manga.find();
      for (const manga of mangas) {
        switch (manga.source) {
          case 'mangadex':
            const { latestChapterId, latestChapter: latestMangadex, fileName } =
              await mangadexController.getLatestChapter(manga.source_id);

            const cover = `https://mangadex.org/covers/${manga.source_id}/${fileName}`;

            const mangadexLinks = {
              chapterLink: `https://mangadex.org/chapter/${latestChapterId}`,
              seriesLink: `https://mangadex.org/title/${manga.source_id}`,
            };

            if (manga.cover !== cover) {
              manga.cover = cover;
              await manga.save();
            }

            checkChapter(client, manga, latestMangadex, mangadexLinks);
            break;
          case 'mangasee':
            const {
              latestChapterUrl,
              latestChapter: latestMangasee,
              link,
            } = await mangaseeController.getLatestChapter(manga.source_id);

            const mangaseeLinks = {
              chapterLink: latestChapterUrl,
              seriesLink: link,
            };

            checkChapter(client, manga, latestMangasee, mangaseeLinks);
            break;
          case 'cubari':
            const { latestChapterUrl: cubariUrl, latestChapter: latestCubari } =
              await cubariController.getLatestChapter(manga.source_id);

            const cubariLinks = {
              chapterLink: cubariUrl,
              seriesLink: manga.source_id,
            };

            checkChapter(client, manga, latestCubari, cubariLinks);
            break;
          case 'tcbscans':
            const { latestChapterUrl: tcbUrl, latestChapter: latestTcb } =
              await tcbscansController.getLatestChapter(manga.source_id);

            const tcbLinks = {
              chapterLink: tcbUrl,
              seriesLink: manga.source_id,
            };

            checkChapter(client, manga, latestTcb, tcbLinks);
            break;
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  });
};

module.exports = {
  getLatestChapters,
};
