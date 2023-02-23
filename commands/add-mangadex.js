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
  cancelEmbed,
  errorEmbed,
} = require('../components/embeds');

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
    let manga = { textChannelId };

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

      const selectFilter = (i) => {
        i.deferUpdate();
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

      const id = selectMenuMessage.values[0];
      const { title, description, fileName } = await getMangaDetails(id);
      const cover = `https://mangadex.org/covers/${id}/${fileName}`;

      manga = { ...manga, id, title, cover };

      const selectedMangaEmbed = mangaDetailsEmbed(title, description, cover);

      await selectMenuMessage.update({
        embeds: [selectedMangaEmbed],
        components: [buttonRow],
      });

      message = await interaction.fetchReply();

      const buttonFilter = (i) => {
        i.deferUpdate();
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
        const { latestChapter } = await getLatestChapter(manga.id);
        console.log('latest chapter', latestChapter);
        console.log(manga);
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
