import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Stability AI route is working!' });
});

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build multipart/form-data
    const form = new FormData();
    form.append('prompt', prompt);

    // Optionally set more fields (model, mode, etc.) depending on your plan:
    // form.append('model', 'sd3.5-large');
    // form.append('output_format', 'png');

    // Example endpoint for "core" or "ultra"
    const endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/core';
    // If you have "ultra", use:
    // const endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';

    const response = await axios.post(endpoint, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: 'application/json', // so the API returns JSON with base64
      },
    });

    console.log('Stability API response data:', response.data);

    // If the API returns an `image` field
    if (!response.data.image) {
      throw new Error('No image was generated or image field is missing.');
    }

    // Convert the base64 from response.data.image to a data URL
    const base64Image = response.data.image;
    res.status(200).json({ photo: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    console.error('Error generating image:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    res.status(500).json({
      error:
        error?.response?.data ||
        error.message ||
        'Something went wrong with Stability AI',
    });
  }
});

export default router;
