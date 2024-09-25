const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Twitter API credentials
const BEARER_TOKEN = process.env.BEARER_TOKEN; // Your Bearer token from Twitter
const ACCESS_TOKEN = process.env.ACCESS_TOKEN; // OAuth access token for the user
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// Step 1: Upload the image to the media endpoint
async function uploadImage(imagePath) {
    const formData = new FormData();
    formData.append('media', fs.createReadStream(imagePath));

    try {
        const response = await axios.post('https://upload.twitter.com/1.1/media/upload.json', formData, {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                ...formData.getHeaders()
            }
        });

        // Return media_id to use in tweet
        return response.data.media_id_string;
    } catch (error) {
        console.error('Error uploading media:', error.response.data);
        throw error;
    }
}

// Step 2: Create a tweet with the uploaded media
async function createTweetWithImage(status, mediaId) {
    const data = {
        status: status, // The text content of your tweet
        media_ids: mediaId // The media_id from the upload response
    };

    try {
        const response = await axios.post('https://api.twitter.com/1.1/statuses/update.json', data, {
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Tweet created successfully:', response.data);
    } catch (error) {
        console.error('Error creating tweet:', error.response.data);
    }
}

// Main function to run the steps
async function main() {
    try {
        // Provide the path to your image
        const imagePath = './path-to-your-image.jpg';
        const mediaId = await uploadImage(imagePath);

        // Create a tweet with the uploaded image
        const tweetText = 'Here’s an image I just uploaded!';
        await createTweetWithImage(tweetText, mediaId);
    } catch (error) {
        console.error('Error in the tweet process:', error);
    }
}

// Run the main function
main();
