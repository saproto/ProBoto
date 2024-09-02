/* Command to create a gif of the FishCam and send it as a reply to the user */

const { SlashCommandBuilder } = require('discord.js');
const GIFEncoder = require('gif-encoder-2')
const { createCanvas } = require('canvas')

class FishcamGifCreator {
    constructor(fishcamUrl) {
        this.url = fishcamUrl;
    }

    async createGif(frameTarget = 10, frameTime = 200, message) {
        let frames;
        try {
            frames = await downloadFrames(this.url, frameTarget, message);
        } catch (err) {
            console.log(err);
            return false;
        }

        if (!frames) return false;

        const encoder = new GIFEncoder(640, 480);
        const gifStream = encoder.createReadStream();
        encoder.start();
        encoder.setRepeat(0);
        encoder.setDelay(frameTime);
        encoder.setQuality(10);

        let prevPercentage = 50;
        const canvas = createCanvas(640, 480);
        const ctx = canvas.getContext('2d');
        for (let i = 0; i<frames.length; i++) {
            const frame = frames[i];
            const image = new Image()
            image.onload = () => {
                ctx.drawImage(image, 0, 0);
                encoder.addFrame(ctx);
            }
            image.src = frame;

            const percentage = ((i+1+frameTarget)/(frameTarget*2))*100;
            if (Math.floor(percentage/10)>Math.floor(prevPercentage/10)) {
                await message.edit(`Creating gifish... ${percentage}%`);
                prevPercentage = percentage;
            }
        }
        encoder.finish();
        return gifStream;
    }
}

async function downloadFrames(url, frameTarget, message) {
    try {
        let stream;
        let prevPercentage = 0;
        const downloadedFrames = await new Promise(resolve => {
            let frames = [];
            stream = https.get(url, res => {
                const boundary = '--' + res.headers['content-type'].split('boundary=')[1];
                let frameData;
                res.on('data', data => {
                    if (frameData === undefined) {
                        frameData = data;
                    } else {
                        frameData = Buffer.concat([frameData, data]);

                        let boundaryIndex = frameData.indexOf(boundary);
                        if (boundaryIndex == 0) {
                            frameData = frameData.slice(boundary.length, frameData.length);
                        }
                        if (boundaryIndex > 1) {
                            let frame = frameData.slice(0, boundaryIndex);
                            let newFrame = frameData.slice(boundaryIndex+boundary.length, frameData.length);


                            let frameStart = frame.indexOf('\r\n\r\n') + 4;
                            frame = frame.slice(frameStart, frame.length);
                            frames.push(frame);
                            const percentage = (frames.length/(frameTarget*2))*100;
                            if (Math.floor(percentage/10)>Math.floor(prevPercentage/10)) {
                                message.edit(`Creating gifish... ${percentage}%`);
                                prevPercentage = percentage;
                            }
                            if (frames.length == frameTarget) {
                                res.destroy();
                                stream.end();
                                resolve(frames);
                            }
                            frameData = newFrame;
                        }
                    }
                });
            });
        });
        stream.end();
        message.edit(`Creating gifish... 50%`);
        return downloadedFrames;
    } catch (err) {
        console.log(err);
        return false;
    }
}

const fishcamGifCreator = new FishcamGifCreator(process.env.FISHCAM_URL);

const commandData = new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Create a GIF of the Fishcam!');

const commandExecute = async interaction => {
    let reply = await interaction.reply('Creating FishCam gif...');
    fishcamGifCreator.createGif(40, 100, reply).then(gifStream => {
        reply.edit('Fi(ni)shed, enjoy!');
        interaction.channel.send({
            files: [{
                attachment: gifStream,
                name: 'fishcam.gif'
            }]
        });
    });
}

module.exports = {
	data: commandData,
	execute: commandExecute
};