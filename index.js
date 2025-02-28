import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));

app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);

app.get('/', async (req, res) => {
  res.status(200).json({
    message: 'Hello from DALL.E!',
  });
});

// Connect to MongoDB
connectDB(process.env.MONGODB_URL);

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(8080, () => console.log('Server started on port 8080'));
}

// Export the Express app for Vercel
export default app;