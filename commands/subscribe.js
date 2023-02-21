const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const { searchManga } = require('../controllers/mangaController');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription(
      'Subscribe to a manga to receive new chapter notifications.'
    )
    .addStringOption((option) =>
      option
        .setName('manga')
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
    const manga = interaction.options.getString('manga');
    const source = interaction.options.getString('source');

    try {
      const results = await searchManga(manga);
      let resultsDescription = 'Select the manga you want to subscribe to.\n';

      if (!results?.length) {
        throw Error('No results found.');
      }

      for (let i = 0; i < results.length; i++) {
        const title = results[i].attributes.title.en;

        resultsDescription += `${i + 1}: ${title}\n`;
      }

      const resultsEmbed = new EmbedBuilder()
        .setTitle('Search Results')
        .setColor('Red')
        .setDescription(resultsDescription);

      await interaction.reply({ embeds: [resultsEmbed] });
    } catch (error) {
      await interaction.reply(error.message);
    }
  },
};
