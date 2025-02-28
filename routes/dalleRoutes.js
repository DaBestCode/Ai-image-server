import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();

const router = express.Router();

// Simple GET route for testing
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Stability AI route is working!' });
});

// POST route to generate images via Stability AI
router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build multipart/form-data
    const form = new FormData();
    form.append('prompt', prompt);

    // Optional parameters (uncomment or adjust as needed):
    // form.append('mode', 'text-to-image');  // For text-to-image
    // form.append('model', 'sd3.5-large');   // e.g. "sd3.5-large-turbo", "sd3.5-medium"
    // form.append('output_format', 'png');   // or "jpeg"

    // Choose your endpoint:
    // "core" is cheaper & faster, "ultra" is more expensive & higher quality
    const endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/core';
    // const endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';

    // Make the POST request to Stability AI
    const response = await axios.post(endpoint, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        // 'Accept: "image/*"' returns raw bytes;
        // we want JSON with base64, so use:
        Accept: 'application/json',
      },
    });

    // Log the raw response for debugging
    console.log('Stability API response data:', response.data);

    // Extract the first artifact
    const artifact = response.data.artifacts && response.data.artifacts[0];
    if (!artifact || !artifact.base64) {
      throw new Error('No image was generated or artifact is missing base64 data.');
    }

    // Return base64 image as data URL
    const base64Image = artifact.base64;
    res.status(200).json({ photo: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    // Log full error for debugging
    console.error('Error generating image:', error);

    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }

    // Send back an error response
    res.status(500).json({
      error:
        error?.response?.data ||
        error.message ||
        'Something went wrong with Stability AI',
    });
  }
});

export default router;
