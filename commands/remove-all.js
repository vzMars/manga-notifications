const { SlashCommandBuilder, ComponentType } = require("discord.js");
const { confirmCancelBtns } = require("../components/buttons");
const { defaultEmbed, errorEmbed } = require("../components/embeds");
const Manga = require("../models/Manga");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-all")
    .setDescription("Removes everything in the subscription list."),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const mangas = await Manga.findAll();

      if (!mangas?.length) {
        throw Error(`The subscription list is empty, nothing to remove.`);
      }

      const buttonRow = confirmCancelBtns();
      const confirmationTitle = `Are you sure you want to remove everything?`;
      const confirmationDescription = `${mangas.length} series will be removed from the subscription list.`;
      const confirm = defaultEmbed(confirmationTitle, confirmationDescription);

      await interaction.editReply({
        embeds: [confirm],
        components: [buttonRow],
      });

      let message = await interaction.fetchReply();

      const buttonFilter = async (i) => {
        await i.deferUpdate();
        return i.customId === "confirm" || i.customId === "cancel";
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

      if (buttonMessage.customId === "confirm") {
        const deletedCount = await Manga.destroy({
          where: {},
        });

        const successDescription = `Successfully removed ${deletedCount} series.`;
        const success = defaultEmbed("Success!", successDescription);

        await interaction.editReply({ embeds: [success], components: [] });
      } else if (buttonMessage.customId === "cancel") {
        const cancel = defaultEmbed("Canceled!", "Successfully canceled.");
        await interaction.editReply({ embeds: [cancel], components: [] });
      }
    } catch (err) {
      const error = errorEmbed(err.message);
      await interaction.editReply({ embeds: [error], components: [] });
    }
  },
};
