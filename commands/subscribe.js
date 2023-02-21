const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require('discord.js');
const {
  searchManga,
  getMangaDetails,
} = require('../controllers/mangaController');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription(
      'Subscribe to a manga to receive new chapter notifications.'
    )
    .addStringOption((option) =>
      option
        .setName('manga-title')
        .setDescription(
          'The name of the manga you want to receive new chapter notifications from.'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('source')
        .setDescription(
          'The source where all the chapter notifications will come from.'
        )
        .setRequired(true)
        .addChoices(
          { name: 'MangaDex', value: 'manga_dex' },
          { name: 'MangaSee', value: 'manga_see' },
          { name: 'Cubari', value: 'cubari' }
        )
    )
    .addChannelOption((option) =>
      option
        .setName('text-channel')
        .setDescription(
          'The text channel where all the notifications will go to.'
        )
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const mangaTitle = interaction.options.getString('manga-title');
    const source = interaction.options.getString('source');

    try {
      const results = await searchManga(mangaTitle);

      if (!results?.length) {
        throw Error('No results found.');
      }

      let resultsDescription = 'Select the manga you want to subscribe to.\n';
      for (let i = 0; i < results.length; i++) {
        const title = results[i].attributes.title.en;
        const year = results[i].attributes.year
          ? `(${results[i].attributes.year})`
          : '(Unknown)';

        resultsDescription += `${i + 1}: ${title} ${year}\n `;
      }

      const resultsEmbed = new EmbedBuilder()
        .setTitle('Search Results')
        .setColor('Red')
        .setDescription(resultsDescription);

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select-manga')
          .setPlaceholder('Select a manga.')
          .addOptions(
            results.map((result, i) => {
              return {
                label: `${i + 1}. ${result.attributes.title.en}`,
                description: `${
                  result.attributes.year
                    ? `(${result.attributes.status})`
                    : '(Unknown)'
                }`,
                value: result.id,
              };
            })
          )
      );

      await interaction.editReply({
        embeds: [resultsEmbed],
        components: [row],
      });
    } catch (error) {
      await interaction.editReply(error.message);
    }
  },
};
