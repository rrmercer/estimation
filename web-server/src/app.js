const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser')


const app = express();

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
app.use(cors({
    origin: '*' // TODO: fixme! this is too permissive
}));
app.use(bodyParser.json());

app.get("", (req, res) => {
    res.send("<h1>Hello!</h1>");
});

app.get("/estimation", (req, res) => {
    res.send(state);
});

app.put("/show_estimations", (req, res) => {
    const reqBody = req.body;
    console.log(`Received post at /show_estimations ${reqBody}`)
    state.showEstimations = reqBody["showEstimations"];
    res.send({status: "OK"});
})

app.listen(() =>  {
    console.log("Server is up!");
});