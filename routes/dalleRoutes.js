import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import * as dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('mode', 'text-to-image');       // Ensure text-to-image mode
    form.append('model', 'sd3.5-large');        // e.g. "sd3.5-large", "sd3-large-turbo"
    form.append('output_format', 'png');        // or "jpeg"
    // Optionally: form.append('cfg_scale', '7'); 
    // Optionally: form.append('negative_prompt', '...');
    // etc.

    const endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/core';
    // or 'https://api.stability.ai/v2beta/stable-image/generate/ultra'

    const response = await axios.post(endpoint, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: 'application/json', // get base64 in JSON
      },
    });

    const artifact = response.data.artifacts && response.data.artifacts[0];
    if (!artifact || !artifact.base64) {
      throw new Error('No image was generated.');
    }
    res.status(200).json({ photo: `data:image/png;base64,${artifact.base64}` });
  } catch (error) {
    console.error('Error generating image:', error?.response?.status, error?.response?.data);
    res.status(500).json({ error: error?.response?.data || error.message });
  }
});

export default router;
