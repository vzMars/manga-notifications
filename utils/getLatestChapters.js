const schedule = require('node-schedule');
const Manga = require('../models/Manga');
const mangadexController = require('../controllers/mangadexController');
const { newChapterEmbed } = require('../components/embeds');

const getLatestChapters = async (client) => {
  schedule.scheduleJob('*/5 * * * *', async () => {
    try {
      const mangas = await Manga.find();
      for (const manga of mangas) {
        switch (manga.source) {
          case 'mangadex':
            const { latestChapterId, latestChapter } =
              await mangadexController.getLatestChapter(manga.source_id);

            if (manga.latestChapter < latestChapter) {
              const chapter = {
                title: manga.title,
                cover: manga.cover,
                chapterNumber: latestChapter,
                chapterLink: `https://mangadex.org/chapter/${latestChapterId}`,
                seriesLink: `https://mangadex.org/title/${manga.source_id}`,
              };

              const newChapter = newChapterEmbed(chapter);
              const channel = client.channels.cache.get(manga.textChannelId);

              manga.latestChapter = latestChapter;
              await manga.save();

              channel.send({ embeds: [newChapter] });
            }
            break;
          case 'mangasee':
            break;
          case 'cubari':
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
