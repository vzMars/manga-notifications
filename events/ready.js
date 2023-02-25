const { Events } = require('discord.js');
const { getLatestChapters } = require('../utils/getLatestChapters');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    getLatestChapters(client);
  },
};
