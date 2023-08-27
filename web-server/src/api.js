const express = require("express");
const serverless = require("serverless-http");
const cors = require('cors');
const bodyParser = require('body-parser')

const app = express();

app.use(cors({
  origin: '*' // TODO: fixme! this is too permissive
}));
app.use(bodyParser.json());

const state = {
  showEstimations: true,
  users: { 
      "rob": {
          "id": 1,
          "risk": "low",
          "complexity": "medium",
          "effort": "high",
          "score": 5
      },
      "john": {
          "id": 2,
          "risk": "low",
          "complexity": "medium",
          "effort": "high",
          "score": 5
      },
      "sally": {
          "id": 3,
          "risk": "low",
          "complexity": "medium",
          "effort": "high",
          "score": 5
      }
  }
};

const router = express.Router();
router.get("/", (req, res) => {
  res.json({
    hello: "hi!"
  });
});

router.get("/estimation", (req, res) => {
  res.send(state);
});

router.put("/show_estimations", (req, res) => {
  const reqBody = req.body;
  console.log(`Received post at /show_estimations ${reqBody}`)
  state.showEstimations = reqBody["showEstimations"];
  res.send({status: "OK"});
});


// Use the router to handle requests to the `/.netlify/functions/api` path
app.use(`/.netlify/functions/api`, router);

// Export the app and the serverless function
module.exports = app;
module.exports.handler = serverless(app);