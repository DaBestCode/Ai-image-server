import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();

const router = express.Router();

// GET route for testing
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from Stability AI!' });
});

// POST route for image generation using Stability AI
router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Create a FormData instance and append the required parameters
    const form = new FormData();
    form.append('prompt', prompt);
    // Optional: set additional parameters as needed:
    // form.append('aspect_ratio', '1:1');
    // form.append('cfg_scale', '7');
    // form.append('steps', '30');
    form.append('output_format', 'png'); // or jpeg, webp

    // Choose the endpoint you want to use:
    // For Stable Image Core:
    const endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/core';
    // For Stable Image Ultra, change endpoint to:
    // const endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';

    // Make the POST request to Stability AI
    const response = await axios.post(endpoint, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: 'application/json', // to receive JSON response with base64 image
      },
    });

    // Stability AI returns an artifacts array containing the generated image(s)
    const artifact = response.data.artifacts && response.data.artifacts[0];
    if (!artifact || !artifact.base64) {
      throw new Error('No image was generated.');
    }
    const base64Image = artifact.base64;
    res.status(200).json({ photo: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    console.error('Error generating image:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error:
        error?.response?.data?.error?.message ||
        error.message ||
        'Something went wrong with Stability AI',
    });
  }
});

export default router;
