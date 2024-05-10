/* Command to create a gif of the FishCam and send it as a reply to the user */

const { SlashCommandBuilder } = require('discord.js');

const commandData = new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify your Proto membership after linking your Discord account on the website.');

const commandExecute = async interaction => {
    try {
        const userId = interaction?.member?.user?.id;
        const apiURL = `${process.env.PROTO_SITE_URL}/api/discord/verify/${userId}`;
        const res = await fetch(apiURL);
        const validationResponse = await res.json();
        if(validationResponse.error) {
            interaction.reply({
                content: `:x:  Verification failed. \n\n ${validationResponse.error}`,
                ephemeral: true
            });
            return;
        }

        const role = interaction.guild.roles.cache.find(role => role.name === 'Proto Members');
        interaction.member.roles.add(role);
        interaction.reply({
            content: `:white_check_mark:  Proto membership was successfully verified. \n
Welcome to our Discord server, ${validationResponse.name}!
Now that you are a verified member, you should be able to see a lot more voice and text channels.
We hope you'll have a nice stay at our Discord server. Enjoy!`,
            ephemeral: true
        });
    }
    catch(e) {
        interaction.replyWithError();
    }
}

module.exports = {
    data: commandData,
    execute: commandExecute
};