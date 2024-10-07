const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
require('dotenv').config();

class TwitterController {
    constructor() {
        this.userClient = new TwitterApi({
            appKey: process.env.API_KEY,
            appSecret: process.env.API_SECRET,
            accessToken: process.env.ACCESS_TOKEN,
            accessSecret: process.env.ACCESS_TOKEN_SECRET,
        });
    }

    async postToTwitter(data) {
        try {
            const { uri, text } = data;

            if (!uri || !text) {
                throw new Error("uri and text are required");
            }

            // Fetch the image as a buffer
            const imageResponse = await axios.get(uri, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data, 'binary');

            // Upload the image to Twitter
            const mediaId = await this.userClient.v1.uploadMedia(imageBuffer, { type: 'image/png' });
            console.log('Uploaded media ID:', mediaId);

            // Post the tweet with the image
            const tweet = await this.userClient.v2.tweet({
                text: text,
                media: {
                    media_ids: [mediaId],
                },
            });

            console.log('Tweet created successfully:', tweet);
            return tweet;
        } catch (error) {
            console.error('Error posting to Twitter:', error);
            throw new Error('Failed to post to Twitter');
        }
    }
}

module.exports = new TwitterController();
