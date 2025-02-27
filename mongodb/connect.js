import mongoose from 'mongoose';

const connectDB = async (url) => {
  try {
    mongoose.set('strictQuery', true);
    
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected.');
      return;
    }

    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect with MongoDB');
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;
