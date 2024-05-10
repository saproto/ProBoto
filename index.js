const fs = require('node:fs');
const path = require('node:path');

//Read the .env file for the bot token
require('dotenv').config();

//Import Discord shizzle
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

//Read the bot token
const token = process.env.BOT_TOKEN;
if(!token) {
    console.log('Cannot proceed. Please make sure to set the Discord bot token in the .env file!');
    process.exit(1);
}

// Create a new client instance and try to login
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

//Boilerplate command handling code from https://discordjs.guide/creating-your-bot/command-handling.html#loading-command-files
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.login(token);

//When ready, notify the user in the console
client.once(Events.ClientReady, readyClient => {
	console.log(`Successfully logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});