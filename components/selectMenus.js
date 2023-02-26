const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const searchResultsMangaDex = (results) => {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select-manga')
      .setPlaceholder('Select a manga.')
      .addOptions(
        results.map((result, i) => {
          const authors = result.relationships
            .filter((relationship) => relationship.type === 'author')
            .map((author) =>
              author.attributes ? author.attributes.name : 'Author Unknown'
            )
            .join(', ');
          return {
            label: `${i + 1}. ${result.attributes.title.en}`,
            description: authors,
            value: result.id,
          };
        })
      )
  );
};

const searchResultsMangaSee = (results) => {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select-manga')
      .setPlaceholder('Select a manga.')
      .addOptions(
        results.map((result, i) => {
          const authors = result.author.join(', ');
          return {
            label: `${i + 1}. ${result.title}`,
            description: authors,
            value: result.link,
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

module.exports = {
  searchResultsMangaDex,
  searchResultsMangaSee,
  mangaListSelectMenu,
};
