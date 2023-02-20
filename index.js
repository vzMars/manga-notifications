const { Client, Collection, GatewayIntentBits } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const commandHandler = require('./handlers/commandHandler');
const connectDB = require('./config/database');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

connectDB();
eventHandler(client);
commandHandler(client);

client.login(process.env.DISCORD_TOKEN);
