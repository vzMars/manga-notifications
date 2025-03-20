const { SlashCommandBuilder } = require("discord.js");
const { mangaListEmbed, errorEmbed } = require("../components/embeds");
const Manga = require("../models/Manga");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("manga-list")
    .setDescription("Shows all the manga in the subscription list."),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const mangas = await Manga.findAll();

      const username = interaction.client.user.username;
      const avatar = interaction.client.user.displayAvatarURL();
      const bot = { username, avatar };

      const guildName = interaction.guild.name;
      const guildIcon = interaction.guild.iconURL();
      const listTitle = `${guildName} \nManga Subscription List\n`;
      let listDescription = "";
      for (let i = 0; i < mangas.length; i++) {
        const title = mangas[i].title;
        const source = mangas[i].source;

        listDescription += `• ${title} (${source})`;
        if (i !== mangas.length - 1) {
          listDescription += "\n";
        }
      }

      if (mangas.length === 0) {
        listDescription = "The subscription list is empty, nothing to show.";
      }

      const mangaList = mangaListEmbed(
        listTitle,
        listDescription,
        guildIcon,
        bot
      );
      await interaction.editReply({ embeds: [mangaList] });
    } catch (err) {
      const error = errorEmbed(err.message);
      await interaction.editReply({ embeds: [error], components: [] });
    }
  },
};
