import fs from 'fs'
import dotenv from 'dotenv'
import FishcamGif from "./FishcamGif.js";
import Discord from 'discord.js';

dotenv.config();

const fishcam = new FishcamGif(process.env.FISHCAM_URL);
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    if (msg.content === '!fish') {
        msg.reply('Creating gifish... 0%').then(reply => {
            fishcam.createGif(40, 100, reply).then(gifStream => {
                reply.edit('Fi(ni)shed, enjoy!');
                const attachment = new Discord.MessageAttachment(gifStream, 'fishcam.gif');
                msg.channel.send('', {files: [attachment]});
            }).catch(err => {
                console.log(err);
                reply.edit('Something went wrong, @BEHEEEEER!');
            });
        })
    } else if (msg.content === '!help') {
        msg.reply('I currently only have one purpose, send `!fish` to see the fishes.');
    }
});

client.login(process.env.BOT_TOKEN);

