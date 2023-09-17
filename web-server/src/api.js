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
          "id": "1",
          "risk": "low",
          "complexity": "medium",
          "effort": "high",
          "score": 5
      },
      "john": {
          "id": "2",
          "risk": "low",
          "complexity": "medium",
          "effort": "low",
          "score": 3
      },
      "sally": {
          "id": "3",
          "risk": "low",
          "complexity": "low",
          "effort": "low",
          "score": 1
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

router.delete("/estimate", (req, res) => {
  const newUsers = {...state.users};
  for (let user in newUsers) {
    newUsers[user] = {
      "id": newUsers[user]["id"],
    };
  }
  console.log(`DELETE estimation called: updating ${newUsers}`);
  state.users = newUsers;
  res.send({status: "OK"});
})

router.put("/estimate", (req, res) => {
  // Example req body: {user: user, newScore: newScore, "effort": level})
  const {id, user, newScore, effort, risk, complexity} = req.body;
  console.log(`estimation called: updating ${user}`);
  if (!(user in state["users"])) {
    // if the user does not exist yet
    state["users"][user] = {}
  }
  if (id) {
    // Note: this is pretty silly to use the username as the primary key instead of the id; 
    // this should be fixed. It's because of how this program evolved that I started with username
    // as the id and then added id to fix some react issues rendering rows in the ux.
    // This is "alright" for now since the source of truth for the rows that are being updated here
    // are on the locals; not this backend
    state["users"][user]["id"] = id;
  }
  if (effort) {
    state["users"][user]["effort"] = effort;
  }
  if (risk) {
    state["users"][user]["risk"] = risk;
  }
  if (complexity) {
    state["users"][user]["complexity"] = complexity;
  }
  state["users"][user]["score"] = newScore;

  console.log(`After estimate put ${JSON.stringify(state)}`);
  res.send({status: "OK"})
})


// Use the router to handle requests to the `/.netlify/functions/api` path
app.use(`/.netlify/functions/api`, router);

// Export the app and the serverless function
module.exports = app;
module.exports.handler = serverless(app);