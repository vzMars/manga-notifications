const schedule = require("node-schedule");
const Manga = require("../models/Manga");
const mangadexController = require("../controllers/mangadexController");
const mangaseeController = require("../controllers/mangaseeController");
const { newChapterEmbed } = require("../components/embeds");

const checkChapter = async (client, manga, latestchapter, links) => {
  if (manga.latestchapter < latestchapter) {
    const chapter = {
      title: manga.title,
      cover: manga.cover,
      chapterNumber: latestchapter,
      chapterLink: links.chapterLink,
      seriesLink: links.seriesLink,
    };

    const newChapter = newChapterEmbed(chapter);
    const channel = client.channels.cache.get(manga.textChannelId);

    manga.latestchapter = latestchapter;
    await manga.update({
      latestchapter,
    });

    channel.send({ embeds: [newChapter] });
  }
};

const getLatestChapters = async (client) => {
  schedule.scheduleJob("*/30 * * * *", async () => {
    try {
      const mangas = await Manga.findAll();
      for (const manga of mangas) {
        switch (manga.source) {
          case "mangadex":
            const {
              latestChapterId,
              latestchapter: latestMangadex,
              fileName,
            } = await mangadexController.getLatestChapter(manga.source_id);

            const cover = `https://mangadex.org/covers/${manga.source_id}/${fileName}`;

            const mangadexLinks = {
              chapterLink: `https://mangadex.org/chapter/${latestChapterId}`,
              seriesLink: `https://mangadex.org/title/${manga.source_id}`,
            };

            if (manga.cover !== cover) {
              manga.cover = cover;
              await manga.update({
                cover,
              });
            }

            checkChapter(client, manga, latestMangadex, mangadexLinks);
            break;
          case "mangasee":
            const {
              latestChapterUrl,
              latestchapter: latestMangasee,
              link,
            } = await mangaseeController.getLatestChapter(manga.source_id);

            const mangaseeLinks = {
              chapterLink: latestChapterUrl,
              seriesLink: link,
            };

            checkChapter(client, manga, latestMangasee, mangaseeLinks);
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
