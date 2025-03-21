# MangaNotifications

A self-hosted manga notification Discord bot that sends notifications to the server when a new chapter is released. Users are able to track a series from MangaDex and MangaSee and receive new chapter notifications straight into their discord server.

![alt text](https://i.imgur.com/VQa6QTx.png)

## Commands:

**/add-mangadex**: Adds a manga to the subscription list. Chapter notifications come from MangaDex.

This command takes in the title of the series and the text channel to which all the notifications will be posted to. This command uses the MangaDex API to search for the series and the API returns the search results that match the title provided. The user can then select a series from those results and add it to the database. If the API returned an empty array with no results found the bot responds with an error message.

**/add-mangasee**: Adds a manga to the subscription list. Chapter notifications come from MangaSee.

This command takes in the title of the series and the text channel to which all the notifications will be posted to. This command uses the Puppeteer library to search for the series on MangaSee and returns the first 10 results that match the title provided. The user can then select a series from those results and add it to the database. If there were no results found with that title the bot responds with an error message.

**/manga-list**: Shows all the manga in the subscription list.

This command retrieves all the series that the server is currently tracking and the bot responds with an embed that displays every single series and where that series is sourced from.

**/remove**: Remove a manga from the subscription list.

This command takes in the title of the series that will be removed and returns a filtered list of series that was found in the database that match/contain that title. The user can then select a series in that list to remove.

**/remove-all**: Removes everything in the subscription list.

This command removes every single series that is currently being tracked by the server from the database.

## Self-Hosting:

To self host this bot in your own server you would have to set up these environment variables.

### Environment Variables

- `DISCORD_TOKEN`: Discord bot token
- `CLIENT_ID`: Discord application id
- `GUILD_ID`: Discord server id
- `DATABASE_URI`: Database uri

## How It's Made:

**Tech used:** JavaScript, Node.js, Discord.js, PostgreSQL, Cheerio, Puppeteer, RSS-Parser

This application was made using the discord.js library and has different ways of retrieving the latest chapter depending on the source. MangaSee also does not have a public API and since it is a SPA the Puppeteer library must be used for when the bot searches for the manga to add to the database. But luckily once the series has been added to the database the bot can use RSS-Parser to scrape the website's RSS feed and get the latest chapter. While with MangaDex they have their own API that can be used to fetch the latest chapter.

Node Schedule is used to set up a cron job that is done every 30 minutes, which goes through all the manga series in the database that the server is tracking and checks if any of them have a new chapter.

Each manga series that is stored on the database keeps track of the title, source, and source id so no duplicate series are added to the database that are from the same source. The latest chapter number is also stored in the database and is used to compare against the latest chapter that is retrieved by scraping the website (MangaSee) or from the website's API (MangaDex) and the text channel id (where in the discord server the notifications get posted to).

## Optimizations:

There haven't been any issues with getting the latest chapter from the MangaDex source since I'm using their API, but i would like to improve on the way i get the latest chapter from Mangasee.

## Lessons Learned:

I learned how to create a discord bot that was made using the discord.js library. I was able to use this bot to scrape websites or fetch data from an API and send notifications using that data to a server. I can use this bot to scrape any type of data from any website and use that data to send notifications to a server. Also by using Node Schedule, I was able to set up a cron job that automated this process so that it was done every 30 minutes.

## More Projects:

Take a look at these other projects that I have in my portfolio:

**Employee CRM API:** https://github.com/vzMars/employee-crm-api

**GameBlog API:** https://github.com/vzMars/gameblog-api

**Discord YouTube Bot:** https://github.com/vzMars/discord-youtube-bot
