const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const {
  searchManga,
  getMangaDetails,
} = require('../controllers/mangaController');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription(
      'Subscribe to a manga to receive new chapter notifications.'
    )
    .addStringOption((option) =>
      option
        .setName('manga-title')
        .setDescription(
          'The name of the manga you want to receive new chapter notifications from.'
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('source')
        .setDescription(
          'The source where all the chapter notifications will come from.'
        )
        .setRequired(true)
        .addChoices(
          { name: 'MangaDex', value: 'manga_dex' },
          { name: 'MangaSee', value: 'manga_see' },
          { name: 'Cubari', value: 'cubari' }
        )
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
    const mangaTitle = interaction.options.getString('manga-title');
    const source = interaction.options.getString('source');
    const textChannelID = interaction.options.getChannel('text-channel').id;
    let manga = { source, textChannelID };

    try {
      const results = await searchManga(mangaTitle);

      if (!results?.length) {
        throw Error('No results found.');
      }

      let resultsDescription = 'Select the manga you want to subscribe to.\n';
      for (let i = 0; i < results.length; i++) {
        const title = results[i].attributes.title.en;
        const year = results[i].attributes.year
          ? `(${results[i].attributes.year})`
          : '(Unknown)';

        resultsDescription += `${i + 1}: ${title} ${year}\n `;
      }

      const resultsEmbed = new EmbedBuilder()
        .setTitle('Search Results')
        .setColor('Red')
        .setDescription(resultsDescription);

      const selectRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select-manga')
          .setPlaceholder('Select a manga.')
          .addOptions(
            results.map((result, i) => {
              return {
                label: `${i + 1}. ${result.attributes.title.en}`,
                description: `${
                  result.attributes.year
                    ? `(${result.attributes.status})`
                    : '(Unknown)'
                }`,
                value: result.id,
              };
            })
          )
      );

      await interaction.reply({
        embeds: [resultsEmbed],
        components: [selectRow],
      });

      const message = await interaction.fetchReply();

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 15000,
      });

      collector.on('collect', async (i) => {
        const id = i.values[0];
        const selectedManga = await getMangaDetails(id);
        const title = selectedManga.attributes.title.en;
        const author = selectedManga.relationships.find(
          (relationship) => relationship.type === 'author'
        ).attributes.name;
        const description = selectedManga.attributes.description.en
          ? selectedManga.attributes.description.en
          : 'Description Unavailable';
        const { fileName } = selectedManga.relationships.find(
          (relationship) => relationship.type === 'cover_art'
        ).attributes;
        const cover = `https://mangadex.org/covers/${id}/${fileName}`;
        manga = { ...manga, id, title, author, description, cover };

        const selectedMangaEmbed = new EmbedBuilder()
          .setTitle(`Did you mean to add \`${title}\`?`)
          .setColor('Red')
          .setDescription(description)
          .setImage(cover);

        await i.update({
          embeds: [selectedMangaEmbed],
          components: [],
        });
      });

      collector.on('end', async (collected) => {
        console.log(collected.size);
        if (collected.size === 0) {
          const error = new EmbedBuilder()
            .setTitle(`Error`)
            .setColor('Red')
            .setDescription(
              `You didn't respond in time! Please rerun the command.`
            );
          await interaction.editReply({ embeds: [error], components: [] });
        }
      });
    } catch (error) {
      console.log(error);
      await interaction.editReply(error.message);
    }
  },
};
