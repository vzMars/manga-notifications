const { EmbedBuilder } = require('discord.js');

const listEmbed = (title, resultsDescription) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setColor('Gold')
    .setDescription(resultsDescription);
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

const successEmbed = (description) => {
  return new EmbedBuilder()
    .setTitle('Success!')
    .setColor('Gold')
    .setDescription(description);
};

const cancelEmbed = () => {
  return new EmbedBuilder()
    .setTitle('Canceled!')
    .setColor('Gold')
    .setDescription('Successfully canceled.');
};

const errorEmbed = (message) => {
  return new EmbedBuilder()
    .setTitle('Error!')
    .setColor('Red')
    .setDescription(message);
};

module.exports = {
  listEmbed,
  mangaDetailsEmbed,
  successEmbed,
  cancelEmbed,
  errorEmbed,
};
