const { SlashCommandBuilder, ComponentType } = require('discord.js');
const { mangaListSelectMenu } = require('../components/selectMenus');
const { confirmCancelBtns } = require('../components/buttons');
const {
  mangaDetailsEmbed,
  defaultEmbed,
  errorEmbed,
} = require('../components/embeds');
const Manga = require('../models/Manga');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes a manga from the subscription list.')
    .addStringOption((option) =>
      option
        .setName('manga-title')
        .setDescription('The title of the manga.')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const mangaTitle = interaction.options.getString('manga-title');

    try {
      const mangas = await Manga.find();

      if (!mangas?.length) {
        throw Error(`The subscription list is empty, nothing to remove.`);
      }

      const titleFilter = mangas
        .filter((manga) =>
          manga.title.toLowerCase().includes(mangaTitle.toLowerCase())
        )
        .slice(0, 25);

      if (!titleFilter?.length) {
        throw Error(
          `No manga with that name on the subscription list, nothing to remove.`
        );
      }

      let mangasDescription =
        'Select the manga that will be removed from the subscription list.\n';
      for (let i = 0; i < titleFilter.length; i++) {
        const title = titleFilter[i].title;
        const source = titleFilter[i].source;
        mangasDescription += `${i + 1}. ${title} (${source})\n`;
      }

      const mangaList = defaultEmbed('Remove Manga', mangasDescription);
      const selectRow = mangaListSelectMenu(titleFilter);
      const buttonRow = confirmCancelBtns();

      await interaction.editReply({
        embeds: [mangaList],
        components: [selectRow],
      });

      let message = await interaction.fetchReply();

      const selectFilter = async (i) => {
        await i.deferUpdate();
        return i.customId === 'remove-manga';
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
      const manga = await Manga.findOne({ source_id });
      const title = manga.title;
      const mangaDetailsTitle = `Are you sure you want to remove \`${title}\`?`;
      const selectedMangaEmbed = mangaDetailsEmbed(
        mangaDetailsTitle,
        '',
        manga.cover
      );

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
        await manga.remove();

        const successDescription = `Successfully removed ${title}.`;
        const success = defaultEmbed('Success!', successDescription);

        await interaction.editReply({ embeds: [success], components: [] });
      } else if (buttonMessage.customId === 'cancel') {
        const cancel = defaultEmbed('Canceled!', 'Successfully canceled.');
        await interaction.editReply({ embeds: [cancel], components: [] });
      }
    } catch (err) {
      console.log(err);
      const error = errorEmbed(err.message);
      await interaction.editReply({ embeds: [error], components: [] });
    }
  },
};
