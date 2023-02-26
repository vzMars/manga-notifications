const {
  SlashCommandBuilder,
  ChannelType,
  ComponentType,
} = require('discord.js');
const {
  searchManga,
  getMangaDetails,
} = require('../controllers/mangaseeController');
const { searchResultsMangaSee } = require('../components/selectMenus');
const { confirmCancelBtns } = require('../components/buttons');
const { defaultEmbed, errorEmbed } = require('../components/embeds');
const Manga = require('../models/Manga');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-mangasee')
    .setDescription(
      'Adds a manga to the subscription list. Chapter notifications come from mangasee123.com'
    )
    .addStringOption((option) =>
      option
        .setName('manga-title')
        .setDescription('The title of the manga.')
        .setRequired(true)
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
    const textChannelId = interaction.options.getChannel('text-channel').id;

    try {
      const results = await searchManga(mangaTitle);

      if (!results?.length) {
        throw Error('No results found.');
      }

      let resultsDescription =
        'Select the manga that will be added to the subscription list.\n';
      for (let i = 0; i < results.length; i++) {
        const title = results[i].title;
        const year = results[i].year;

        resultsDescription += `${i + 1}. ${title} (${year})\n`;
      }

      const resultsList = defaultEmbed('Search Results', resultsDescription);
      const selectRow = searchResultsMangaSee(results);
      const buttonRow = confirmCancelBtns();

      await interaction.editReply({
        embeds: [resultsList],
        components: [selectRow],
      });

      let message = await interaction.fetchReply();

      const selectFilter = async (i) => {
        await i.deferUpdate();
        return i.customId === 'select-manga';
      };

      const selectMenuMessage = await message
        .awaitMessageComponent({
          selectFilter,
          componentType: ComponentType.StringSelect,
          time: 20000,
        })
        .catch((err) => {
          throw Error(`You didn't respond in time! Please rerun the command.`);
        });

      const url = selectMenuMessage.values[0];
      const { title, description, cover, source_id } = await getMangaDetails(
        url
      );
    } catch (err) {
      const error = errorEmbed(err.message);
      await interaction.editReply({ embeds: [error], components: [] });
    }
  },
};
