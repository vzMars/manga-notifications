const { EmbedBuilder } = require('discord.js');

const errorEmbed = async (interaction, message) => {
  const error = new EmbedBuilder()
    .setTitle(`Error`)
    .setColor('Red')
    .setDescription(message);
  await interaction.editReply({ embeds: [error], components: [] });
};

module.exports = {
  errorEmbed,
};
