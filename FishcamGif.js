import GIFEncoder from "gifencoder";
import https from "https";
import canvas from 'canvas'
const { createCanvas, Image } = canvas;

export default class FishcamGif {
    constructor(fishcamUrl) {
        this.url = fishcamUrl;
    }

    async createGif(frameTarget = 10, frameTime = 200) {
        try {
            const frames = await downloadFrames(this.url, frameTarget);
        } catch (err) {
            console.log(err);
        }

        const encoder = new GIFEncoder(640, 480);
        const gifStream = encoder.createReadStream();
        encoder.start();
        encoder.setRepeat(0);
        encoder.setDelay(frameTime);
        encoder.setQuality(10);

        const canvas = createCanvas(640, 480);
        const ctx = canvas.getContext('2d');
        for (const frame of frames) {
            const image = new Image()
            image.onload = () => {
                ctx.drawImage(image, 0, 0);
                encoder.addFrame(ctx);
            }
            image.src = frame;
        }
        encoder.finish();
        return gifStream;
    }
}

async function downloadFrames(url, frameTarget) {
    try {
        const downloadedFrames = await new Promise(resolve => {
            let frames = [];
            const stream = https.get(url, res => {
                const boundary = '--' + res.headers['content-type'].split('boundary=')[1];
                let frameData;
                res.on('data', data => {
                    let boundaryIndex = data.indexOf(boundary);

                    if (frameData === undefined) {
                        frameData = data;
                    } else if (boundaryIndex > 0) {
                        let oldFrame = data.slice(0, boundaryIndex);
                        let newFrame = data.slice(boundaryIndex, data.length);

                        let frame = Buffer.concat([frameData, oldFrame]);
                        let frameStart = frame.indexOf('\r\n\r\n') + 4;
                        frame = frame.slice(frameStart, frame.length);
                        frames.push(frame);
                        console.log(`Downloaded frame #${frames.length}`);
                        if (frames.length == frameTarget) {
                            res.destroy();
                            stream.end();
                            resolve(frames);
                        }
                        frameData = newFrame;
                    } else {
                        frameData = Buffer.concat([frameData, data]);
                    }
                });
            });
        });

        return downloadedFrames;
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

