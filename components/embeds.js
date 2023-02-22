const { EmbedBuilder } = require('discord.js');

const errorEmbed = async (interaction, message) => {
  const error = new EmbedBuilder()
    .setTitle('Error')
    .setColor('Red')
    .setDescription(message);
  await interaction.editReply({ embeds: [error], components: [] });
};

const cancelEmbed = async (interaction) => {
  const cancel = new EmbedBuilder()
    .setTitle('Canceled')
    .setColor('White')
    .setDescription('Successfully canceled.');
  await interaction.editReply({ embeds: [cancel], components: [] });
};

module.exports = {
  errorEmbed,
  cancelEmbed,
};
