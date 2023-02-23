const { EmbedBuilder } = require('discord.js');

const searchResultsEmbed = (resultsDescription) => {
  return new EmbedBuilder()
    .setTitle('Search Results')
    .setColor('Gold')
    .setDescription(resultsDescription);
};

const mangaDetailsEmbed = (title, description, cover) => {
  return new EmbedBuilder()
    .setTitle(`Did you mean to add \`${title}\`?`)
    .setColor('Gold')
    .setDescription(description)
    .setImage(cover);
};

const cancelEmbed = () => {
  return new EmbedBuilder()
    .setTitle('Canceled')
    .setColor('Gold')
    .setDescription('Successfully canceled.');
};

const errorEmbed = (message) => {
  return new EmbedBuilder()
    .setTitle('Error')
    .setColor('Red')
    .setDescription(message);
};

module.exports = {
  searchResultsEmbed,
  mangaDetailsEmbed,
  cancelEmbed,
  errorEmbed,
};
