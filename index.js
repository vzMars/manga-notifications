require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const commandHandler = require("./handlers/commandHandler");
const { connectDB, sequelize } = require("./config/database");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

(async () => {
  try {
    await connectDB();

    await sequelize.sync({ force: false });

    console.log("Database synced");

    eventHandler(client);
    commandHandler(client);

    client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
})();
