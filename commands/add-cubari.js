const {
  SlashCommandBuilder,
  ChannelType,
  ComponentType,
} = require('discord.js');
const {
  getMangaDetails,
  getLatestChapter,
} = require('../controllers/cubariController');
const { searchResultsMangaSee } = require('../components/selectMenus');
const { confirmCancelBtns } = require('../components/buttons');
const {
  defaultEmbed,
  mangaDetailsEmbed,
  errorEmbed,
} = require('../components/embeds');
const Manga = require('../models/Manga');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-cubari')
    .setDescription(
      'Adds a manga to the subscription list. Chapter notifications come from cubari.moe'
    )
    .addStringOption((option) =>
      option
        .setName('manga-link')
        .setDescription(
          'The cubari link to the manga series. (e.g. https://cubari.moe/read/gist/OPM/)'
        )
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
    const mangaLink = interaction.options.getString('manga-link');
    const textChannelId = interaction.options.getChannel('text-channel').id;

    try {
      if (!mangaLink.includes('cubari.moe/read/gist/')) {
        throw Error(
          'Provide a link to the series that looks like https://cubari.moe/read/gist/JYHJU/'
        );
      }

      const manga = await getMangaDetails(mangaLink);

      if (!manga) {
        throw Error(`Could not find series at ${mangaLink}`);
      }

      if (manga === 'reader') {
        throw Error('Provide a link to the series, not an actual chapter.');
      }

      const { latestChapter } = getLatestChapter(mangaLink);
    } catch (err) {
      const error = errorEmbed(err.message);
      await interaction.editReply({ embeds: [error], components: [] });
    }
  },
};
