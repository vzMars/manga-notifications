const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { searchManga } = require('../controllers/mangaseeController');
const { errorEmbed } = require('../components/embeds');
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

      console.log(results);
    } catch (err) {
      const error = errorEmbed(err.message);
      await interaction.editReply({ embeds: [error], components: [] });
    }
  },
};
