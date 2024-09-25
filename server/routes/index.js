"use strict";

// import express from "express";
const express = require("express");
const router = express.Router();

const main  = require("../../api/index.js");

router.post("/", async (req, res) => {
  const action = main(req);
  res.send(action);
});

module.exports = router;
