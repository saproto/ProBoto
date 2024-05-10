/*
    Refresh all the slash commands in the Discord server. Make sure to set the properties in the .env file first!
    Most code taken from https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands
*/
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const token = process.env.BOT_TOKEN;
const applicationId = process.env.APPLICATION_ID;
const serverId = process.env.SERVER_ID;

const commands = [];
// Grab all the command folders from the commands directory
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory 
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy the commands
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} command(s).`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(applicationId, serverId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} command(s).`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();