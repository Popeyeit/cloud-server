require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const authRouter = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api/auth', authRouter);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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
