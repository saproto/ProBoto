import GIFEncoder from "gifencoder";
import https from "https";
import canvas from 'canvas'

const { createCanvas, Image } = canvas;

export default class FishcamGif {
    constructor(fishcamUrl) {
        this.url = fishcamUrl;
    }

    async createGif(frameTarget = 10, frameTime = 200) {
        let frames;
        try {
            frames = await downloadFrames(this.url, frameTarget);
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
        return await new Promise(resolve => {
            let frames = [];
            const stream = https.get(url, res => {
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
                            let newFrame = frameData.slice(boundaryIndex, data.length);

                            let frameStart = frame.indexOf('\r\n\r\n') + 4;
                            frame = frame.slice(frameStart, frame.length);
                            frames.push(frame);
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
    } catch (err) {
        console.log(err);
        return false;
    }
}

