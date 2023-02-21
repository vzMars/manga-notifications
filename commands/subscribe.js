const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
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
    await interaction.deferReply();
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

      const row = new ActionRowBuilder().addComponents(
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

      const message = await interaction.editReply({
        embeds: [resultsEmbed],
        components: [row],
      });

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 15000,
      });

      collector.on('collect', async (i) => {
        const id = i.values[0];
        const selectedManga = await getMangaDetails(id);
        const title = selectedManga.attributes.title.en;
        const author = selectedManga.relationships[0].attributes.name;
        const description = selectedManga.attributes.description.en;
        const cover = `https://mangadex.org/covers/${id}/${selectedManga.relationships[2].attributes.fileName}`;
        manga = { ...manga, id, title, author, description, cover };
        console.log(manga);

        const selectedMangaEmbed = new EmbedBuilder()
          .setTitle(`Did you mean to add \`${title}\`?`)
          .setColor('Red')
          .setDescription(description)
          .setImage(cover);

        await i.update({ embeds: [selectedMangaEmbed], components: [] });
      });

      collector.on('end', (collected) => {
        console.log(`Collected ${collected.size} items`);
      });
    } catch (error) {
      await interaction.editReply(error.message);
    }
  },
};
