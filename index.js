require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const authRouter = require("./routes/auth-routes");
const fileRouter = require("./routes/file-routes");
const errorMiddleware = require("./middlewares/error-middleware");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(fileUpload({}));
app.use(express.json());
app.use(express.static("static"));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.use("/api/auth", authRouter);
app.use("/api/files", fileRouter);
app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => {
      console.log("====================================");
      console.log(`Server start on port, ${PORT}`);
      console.log("====================================");
    });
  } catch (error) {
    console.log("====================================");
    console.log("ERROR", error);
    console.log("====================================");
  }
};

start();
