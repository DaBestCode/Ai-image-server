import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build multipart/form-data
    const form = new FormData();
    form.append('prompt', prompt);

    // e.g. "core" endpoint
    const endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/core';

    const response = await axios.post(endpoint, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: 'application/json', // we want JSON w/ base64
      },
    });

    console.log('Stability API response data:', response.data);
    // If your response has "image" field:
    const base64Image = response.data.image;
    if (!base64Image) {
      throw new Error('No image was generated.');
    }

    // Return just the raw base64 (NO prefix)
    res.status(200).json({ photo: base64Image });
  } catch (error) {
    console.error('Error generating image:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    res.status(500).json({
      error: error?.response?.data || error.message || 'Something went wrong',
    });
  }
});

export default router;
