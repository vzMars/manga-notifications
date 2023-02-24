const {
  SlashCommandBuilder,
  ChannelType,
  ComponentType,
} = require('discord.js');
const {
  searchManga,
  getMangaDetails,
  getLatestChapter,
} = require('../controllers/mangadexController');
const { searchResultsSelectMenu } = require('../components/selectMenus');
const { confirmCancelBtns } = require('../components/buttons');
const {
  searchResultsEmbed,
  mangaDetailsEmbed,
  successEmbed,
  cancelEmbed,
  errorEmbed,
} = require('../components/embeds');
const Manga = require('../models/Manga');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-mangadex')
    .setDescription(
      'Adds a manga to the subscription list. Chapter notifications come from mangadex.org'
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
        const title = results[i].attributes.title.en;
        const year = results[i].attributes.year
          ? results[i].attributes.year
          : 'Year Unknown';

        resultsDescription += `${i + 1}: ${title} (${year})\n`;
      }

      const resultsEmbed = searchResultsEmbed(resultsDescription);
      const selectRow = searchResultsSelectMenu(results);
      const buttonRow = confirmCancelBtns();

      await interaction.editReply({
        embeds: [resultsEmbed],
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

      const source_id = selectMenuMessage.values[0];
      const { title, description, fileName } = await getMangaDetails(source_id);
      const cover = `https://mangadex.org/covers/${source_id}/${fileName}`;

      const selectedMangaEmbed = mangaDetailsEmbed(title, description, cover);

      await selectMenuMessage.update({
        embeds: [selectedMangaEmbed],
        components: [buttonRow],
      });

      message = await interaction.fetchReply();

      const buttonFilter = async (i) => {
        await i.deferUpdate();
        return i.customId === 'confirm' || i.customId === 'cancel';
      };

      const buttonMessage = await message
        .awaitMessageComponent({
          buttonFilter,
          componentType: ComponentType.Button,
          time: 20000,
        })
        .catch((err) => {
          throw Error(`You didn't respond in time! Please rerun the command.`);
        });

      if (buttonMessage.customId === 'confirm') {
        const existingManga = await Manga.findOne({ source_id });

        if (existingManga) {
          throw Error(
            `Already receiving ${title} chapter notifications from mangadex.org`
          );
        }

        const { latestChapter } = await getLatestChapter(source_id);
        const source = 'mangadex';
        await Manga.create({
          title,
          cover,
          latestChapter,
          source,
          source_id,
          textChannelId,
        });

        const success = successEmbed(title);
        await interaction.editReply({ embeds: [success], components: [] });
      } else if (buttonMessage.customId === 'cancel') {
        const cancel = cancelEmbed();
        await interaction.editReply({ embeds: [cancel], components: [] });
      }
    } catch (err) {
      const error = errorEmbed(err.message);
      await interaction.editReply({ embeds: [error], components: [] });
    }
  },
};