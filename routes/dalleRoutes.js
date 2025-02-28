import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const router = express.Router();

// Simple GET route for testing
router.route('/').get((req, res) => {
  res.status(200).json({ message: 'Hello from Stability AI!' });
});

// POST route for image generation
router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    // Define your engine ID (adjust if needed)
    const engineId = 'stable-diffusion-512-v2-1';

    // Make the POST request to Stability AI's API
    const response = await axios.post(
      `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
      {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,           // Adjust configuration scale if desired
        height: 1024,           // You can adjust height/width as supported by your chosen engine
        width: 1024,
        samples: 1,
        steps: 30,              // Number of diffusion steps (adjust per API documentation)
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
      }
    );

    // Stability AI returns an "artifacts" array containing generated images
    const artifact = response.data.artifacts && response.data.artifacts[0];
    if (!artifact || !artifact.base64) {
      throw new Error('No image was generated.');
    }
    const base64Image = artifact.base64;
    res.status(200).json({ photo: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    console.error(error);
    // Return the error message as JSON
    res.status(500).json({
      error:
        error?.response?.data ||
        error.message ||
        'Something went wrong with Stability AI',
    });
  }
});

export default router;
