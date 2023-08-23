const express = require('express')
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*'
}));


app.get("", (req, res) => {
    res.send("<h1>Hello!</h1>");
});

app.get("/estimation", (req, res) => {
    res.send({
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
                }
        }
    });
});

app.listen(4000, () =>  {
    console.log("Server is up on port 4000");
});