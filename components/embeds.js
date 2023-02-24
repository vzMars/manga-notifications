const { EmbedBuilder } = require('discord.js');

const defaultEmbed = (title, description) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setColor('Gold')
    .setDescription(description);
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
  mangaDetailsEmbed,
  defaultEmbed,
  errorEmbed,
};
