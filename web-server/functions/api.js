
// import express, { Router } from 'express';
// import serverless from 'serverless-http';

// const api = express();

// const router = Router();
// router.get('/hello', (req, res) => res.send('Hello World!'));

// api.use('/api/', router);

// export const handler = serverless(api);

const express = require("express");
const serverless = require("serverless-http");

// Create an instance of the Express app
const app = express();

// Create a router to handle routes
const router = express.Router();

// Define a route that responds with a JSON object when a GET request is made to the root path
router.get("/", (req, res) => {
  res.json({
    hello: "hi!"
  });
});

// Use the router to handle requests to the `/.netlify/functions/api` path
app.use(`/.netlify/functions/api`, router);

// Export the app and the serverless function
module.exports = app;
module.exports.handler = serverless(app);