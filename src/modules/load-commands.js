const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

let commands = new Collection();

// Grab all the command folders from the commands directory
// General structure for commands: ./commands/command_category/command_files.js
const foldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('disabled_'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            // Seems to be a valid command. Add it to the collection
            commands.set(command.data.name, command);
        } else {
            // Invalid command
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

module.exports = commands;