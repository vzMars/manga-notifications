const schedule = require('node-schedule');
const Manga = require('../models/Manga');
const mangadexController = require('../controllers/mangadexController');
const mangaseeController = require('../controllers/mangaseeController');
const cubariController = require('../controllers/cubariController');
const { newChapterEmbed } = require('../components/embeds');

const getLatestChapters = async (client) => {
  schedule.scheduleJob('*/5 * * * *', async () => {
    try {
      const mangas = await Manga.find();
      for (const manga of mangas) {
        switch (manga.source) {
          case 'mangadex':
            const { latestChapterId, latestChapter: latestMangadex } =
              await mangadexController.getLatestChapter(manga.source_id);

            if (manga.latestChapter < latestMangadex) {
              const chapter = {
                title: manga.title,
                cover: manga.cover,
                chapterNumber: latestMangadex,
                chapterLink: `https://mangadex.org/chapter/${latestChapterId}`,
                seriesLink: `https://mangadex.org/title/${manga.source_id}`,
              };

              const newChapter = newChapterEmbed(chapter);
              const channel = client.channels.cache.get(manga.textChannelId);

              manga.latestChapter = latestMangadex;
              await manga.save();

              channel.send({ embeds: [newChapter] });
            }
            break;
          case 'mangasee':
            const {
              latestChapterUrl,
              latestChapter: latestMangasee,
              link,
            } = await mangaseeController.getLatestChapter(manga.source_id);

            if (manga.latestChapter < latestMangasee) {
              const chapter = {
                title: manga.title,
                cover: manga.cover,
                chapterNumber: latestMangasee,
                chapterLink: latestChapterUrl,
                seriesLink: link,
              };

              const newChapter = newChapterEmbed(chapter);
              const channel = client.channels.cache.get(manga.textChannelId);

              manga.latestChapter = latestMangasee;
              await manga.save();

              channel.send({ embeds: [newChapter] });
            }
            break;
          case 'cubari':
            const { latestChapterUrl: cubariUrl, latestChapter: latestCubari } =
              await cubariController.getLatestChapter(manga.source_id);

            if (manga.latestChapter < latestCubari) {
              const chapter = {
                title: manga.title,
                cover: manga.cover,
                chapterNumber: latestCubari,
                chapterLink: cubariUrl,
                seriesLink: manga.source_id,
              };

              const newChapter = newChapterEmbed(chapter);
              const channel = client.channels.cache.get(manga.textChannelId);

              manga.latestChapter = latestCubari;
              await manga.save();

              channel.send({ embeds: [newChapter] });
            }
            break;
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = {
  getLatestChapters,
};
