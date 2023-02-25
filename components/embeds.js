const { EmbedBuilder } = require('discord.js');

const defaultEmbed = (title, description) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setColor('Gold')
    .setDescription(description);
};

const newChapterEmbed = (chapter) => {
  return new EmbedBuilder()
    .setTitle(`Chapter ${chapter.chapterNumber}`)
    .setURL(chapter.chapterLink)
    .setAuthor({ name: chapter.title, url: chapter.seriesLink })
    .setColor('Gold')
    .setImage(chapter.cover)
    .setTimestamp();
};

const mangaListEmbed = (title, description, icon, bot) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setAuthor({ name: bot.username, iconURL: bot.avatar })
    .setColor('Gold')
    .setDescription(description)
    .setThumbnail(icon);
};

const mangaDetailsEmbed = (title, description, cover) => {
  return description
    ? new EmbedBuilder()
        .setTitle(title)
        .setColor('Gold')
        .setDescription(description)
        .setImage(cover)
    : new EmbedBuilder().setTitle(title).setColor('Gold').setImage(cover);
};

const errorEmbed = (message) => {
  return new EmbedBuilder()
    .setTitle('Error!')
    .setColor('Red')
    .setDescription(message);
};

module.exports = {
  defaultEmbed,
  newChapterEmbed,
  mangaListEmbed,
  mangaDetailsEmbed,
  errorEmbed,
};
