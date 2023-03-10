const { SlashCommandBuilder, ChannelType } = require('discord.js');
const {
  getMangaDetails,
  getLatestChapter,
} = require('../controllers/cubariController');
const { defaultEmbed, errorEmbed } = require('../components/embeds');
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

      const existingManga = await Manga.findOne({ source_id: mangaLink });

      if (existingManga) {
        throw Error(
          `Already receiving ${manga.title} chapter notifications from ${mangaLink}`
        );
      }

      const { latestChapter } = await getLatestChapter(mangaLink);

      const source = 'cubari';
      await Manga.create({
        title: manga.title,
        cover: manga.cover,
        latestChapter,
        source,
        source_id: mangaLink,
        textChannelId,
      });

      const successDescription = `Successfully added ${manga.title}.`;
      const success = defaultEmbed('Success!', successDescription);
      await interaction.editReply({ embeds: [success], components: [] });
    } catch (err) {
      const error = errorEmbed(err.message);
      await interaction.editReply({ embeds: [error], components: [] });
    }
  },
};
