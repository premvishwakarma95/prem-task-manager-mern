import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';

const port = process.env.PORT || 5000;
await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager');
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
