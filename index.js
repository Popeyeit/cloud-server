const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
require('dotenv').config();
const authRouter = require('./routes/auth.routes');

const app = express();
const PORT = config.get('serverPort');

app.use(express.json());
app.use('/api/auth', authRouter);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    app.listen(PORT, () => {
      console.log('====================================');
      console.log(`Server start on port, ${PORT}`);
      console.log('====================================');
    });
  } catch (error) {
    console.log('====================================');
    console.log('ERROR', error);
    console.log('====================================');
  }
};

start();
