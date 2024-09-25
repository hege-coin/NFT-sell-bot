"use strict";

import express from "express";
const router = express.Router();

import handleRequest from "../../api/index.js";

router.post("/", async (req, res) => {
  const action = handleRequest(req);
  res.send(action);
});

export default router;
