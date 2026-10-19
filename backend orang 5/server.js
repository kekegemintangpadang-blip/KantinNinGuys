import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import apiRoutes from './routes/api.js';

const app = express();
app.use(cors());
app.use(express.json());

// Mengarahkan semua request berawalan /api ke file routes/api.js
app.use('/api', apiRoutes);

app.listen(process.env.PORT || 5000, () => {
    console.log(`✅ Backend berjalan di port ${process.env.PORT || 5000}`);
});