const {
  SlashCommandBuilder,
  ChannelType,
  ComponentType,
} = require("discord.js");
const {
  searchManga,
  getMangaDetails,
  getLatestChapter,
} = require("../controllers/mangaseeController");
const { searchResultsMangaSee } = require("../components/selectMenus");
const { confirmCancelBtns } = require("../components/buttons");
const {
  defaultEmbed,
  mangaDetailsEmbed,
  errorEmbed,
} = require("../components/embeds");
const Manga = require("../models/Manga");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-mangasee")
    .setDescription(
      "Adds a manga to the subscription list. Chapter notifications come from mangasee123.com"
    )
    .addStringOption((option) =>
      option
        .setName("manga-title")
        .setDescription("The title of the manga.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("text-channel")
        .setDescription(
          "The text channel where all the notifications will go to."
        )
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const mangaTitle = interaction.options.getString("manga-title");
    const textchannelid = interaction.options.getChannel("text-channel").id;

    try {
      const results = await searchManga(mangaTitle);

      if (!results?.length) {
        throw Error("No results found.");
      }

      let resultsDescription =
        "Select the manga that will be added to the subscription list.\n";
      for (let i = 0; i < results.length; i++) {
        const title = results[i].title;
        const year = results[i].year;

        resultsDescription += `${i + 1}. ${title} (${year})\n`;
      }

      const resultsList = defaultEmbed("Search Results", resultsDescription);
      const selectRow = searchResultsMangaSee(results);
      const buttonRow = confirmCancelBtns();

      await interaction.editReply({
        embeds: [resultsList],
        components: [selectRow],
      });

      let message = await interaction.fetchReply();

      const selectFilter = async (i) => {
        await i.deferUpdate();
        return i.customId === "select-manga";
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

      const mangaDetailsTitle = `Did you mean to add \`${title}\`?`;
      const selectedMangaEmbed = mangaDetailsEmbed(
        mangaDetailsTitle,
        description,
        cover
      );

      await selectMenuMessage.update({
        embeds: [selectedMangaEmbed],
        components: [buttonRow],
      });

      message = await interaction.fetchReply();

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
        const existingManga = await Manga.findOne({ where: { source_id } });

        if (existingManga) {
          throw Error(
            `Already receiving ${title} chapter notifications from mangasee123.com`
          );
        }

        const { latestchapter } = await getLatestChapter(source_id);

        const source = "mangasee";
        await Manga.create({
          title,
          cover,
          latestchapter,
          source,
          source_id,
          textChannelId,
        });

        const successDescription = `Successfully added ${title}.`;
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
