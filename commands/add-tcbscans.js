const { SlashCommandBuilder, ChannelType } = require('discord.js');
const {
  searchManga,
  getMangaDetails,
  getLatestChapter,
} = require('../controllers/tcbscansController');
const { searchResultsTcbScans } = require('../components/selectMenus');
const { confirmCancelBtns } = require('../components/buttons');
const { defaultEmbed, errorEmbed } = require('../components/embeds');
const Manga = require('../models/Manga');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-tcbscans')
    .setDescription(
      'Adds a manga to the subscription list. Chapter notifications come from TCB Scans.'
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
    const textChannelId = interaction.options.getChannel('text-channel').id;

    try {
      const results = await searchManga();

      if (!results?.length) {
        throw Error('No results found.');
      }

      let resultsDescription =
        'Select the manga that will be added to the subscription list.\n';
      for (let i = 0; i < results.length; i++) {
        const title = results[i].title;

        resultsDescription += `${i + 1}. ${title}\n`;
      }

      const resultsList = defaultEmbed('Search Results', resultsDescription);
      const selectRow = searchResultsTcbScans(results);
      const buttonRow = confirmCancelBtns();

      await interaction.editReply({
        embeds: [resultsList],
        components: [selectRow],
      });

      let message = await interaction.fetchReply();
    } catch (err) {
      const error = errorEmbed(err.message);
      await interaction.editReply({ embeds: [error], components: [] });
    }
  },
};
