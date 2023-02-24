const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const searchResultsSelectMenu = (results) => {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select-manga')
      .setPlaceholder('Select a manga.')
      .addOptions(
        results.map((result, i) => {
          const author = result.relationships.find(
            (relationship) => relationship.type === 'author'
          );
          return {
            label: `${i + 1}. ${result.attributes.title.en}`,
            description: `${
              author.attributes ? author.attributes.name : 'Author Unknown'
            }`,
            value: result.id,
          };
        })
      )
  );
};

const mangaListSelectMenu = (mangas) => {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('remove-manga')
      .setPlaceholder('Remove a manga.')
      .addOptions(
        mangas.map((manga, i) => {
          return {
            label: `${i + 1}. ${manga.title} (${manga.source})`,
            value: manga.source_id,
          };
        })
      )
  );
};

module.exports = { searchResultsSelectMenu, mangaListSelectMenu };
