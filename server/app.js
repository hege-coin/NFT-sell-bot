"use strict";
import express from "express";

import routes from "./routes/index.js";
const app = express();

// app.use(cors());
app.use(express.json());
// app.use(morgan("tiny"));

app.use("/", routes);

// 404 Handler
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

export default app;
