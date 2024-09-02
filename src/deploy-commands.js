/*
    Refresh all the slash commands in the Discord server. Make sure to set the properties in the .env file first!
    Most code taken from https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands
*/
const { REST, Routes } = require('discord.js');

require('dotenv').config();

const token = process.env.BOT_TOKEN;
const applicationId = process.env.APPLICATION_ID;
const serverId = process.env.SERVER_ID;

const commands = require('./modules/load-commands');

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy the commands
(async () => {
	try {
		console.log(`Started refreshing ${commands.size} command(s).`);
		let restCommands = [];
		for(command of commands.values()){
			restCommands.push(command.data.toJSON());
		}
		// The put method is used to fully refresh all commands in the server with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(applicationId, serverId),
			{ body: restCommands },
		);

		console.log(`Successfully reloaded ${data.length} command(s).`);
	} catch (error) {
		// Log any errors
		console.error(error);
	}
})();