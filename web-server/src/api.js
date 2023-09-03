const express = require("express");
const serverless = require("serverless-http");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors({
  origin: '*' // TODO: fixme! this is too permissive
}));
const jsonParser = bodyParser.json()
app.use(jsonParser);
app.use(bodyParser.urlencoded({ extended: true }))

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
    status: "alive"
  });
});

router.get("/estimation", (req, res) => {
  res.send(state);
});

router.put("/show_estimations", (req, res) => {
  state.showEstimations = req.body.showEstimations;
  res.send({status: "OK"});
});

router.put("/effort", (req, res) => {
  //state
  res.send({status: "OK"})
})


// Use the router to handle requests to the `/.netlify/functions/api` path
app.use(`/.netlify/functions/api`, router);

// Export the app and the serverless function
module.exports = app;
module.exports.handler = serverless(app);