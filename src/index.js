// Read the .env file for the bot token
require('dotenv').config();

// Import Discord shizzle
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// Load the list of commands
const commands = require('./modules/load-commands');

// Read the bot token
const token = process.env.BOT_TOKEN;
if(!token) {
    console.log('Cannot proceed. Please make sure to set the BOT_TOKEN in the .env file!');
    process.exit(1);
}

// Create a new client instance and try to login
const client = new Client({intents: [GatewayIntentBits.Guilds]});
client.commands = commands;
client.login(token);

// When ready, notify the user in the console
client.once(Events.ClientReady, readyClient => {
	console.log(`Successfully logged in as ${readyClient.user.tag}`);
});

// Listen for incoming commands
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	//Valid command, try to execute it and reply to the user
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