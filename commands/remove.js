const { SlashCommandBuilder, ComponentType } = require('discord.js');
const { mangaListSelectMenu } = require('../components/selectMenus');
const { confirmCancelBtns } = require('../components/buttons');
const {
  listEmbed,
  mangaDetailsEmbed,
  successEmbed,
  cancelEmbed,
  errorEmbed,
} = require('../components/embeds');
const Manga = require('../models/Manga');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes a manga from the subscription list.'),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const mangas = await Manga.find();
      let mangasDescription =
        'Select the manga that will be removed from the subscription list.\n';
      for (let i = 0; i < mangas.length; i++) {
        const title = mangas[i].title;
        const source = mangas[i].source;
        mangasDescription += `${i + 1}. ${title} (${source})\n`;
      }

      const mangaList = listEmbed('Remove Manga', mangasDescription);
      const selectRow = mangaListSelectMenu(mangas);
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
        const success = successEmbed(successDescription);

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
