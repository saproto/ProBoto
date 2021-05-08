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
        const replyMsg = msg.reply('Creating gifish...');
        console.log('Starting GIF creation');
        fishcam.createGif(10, 200).then(gifStream => {
            replyMsg.then(reply => {
                reply.edit('Fi(ni)shed, enjoy!');
            });
            const attachment = new Discord.MessageAttachment(gifStream, 'fishcam.gif');
            msg.channel.send('', {files: [attachment]});
        }).catch(err => {
            console.log(err);
        });
    } else if (msg.content === '!help') {
        msg.reply('I currently only have one purpose, send `!fish` to see the fishes.');
    }
});

client.login(process.env.BOT_TOKEN);

