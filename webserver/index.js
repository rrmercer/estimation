const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors({
  origin: '*' // @todo fixme! this is too permissive
}));
const jsonParser = bodyParser.json()
app.use(jsonParser);
app.use(bodyParser.urlencoded({ extended: true }))

const INIT_STATE = {
   showEstimations: true,
   lastClearTimestamp: undefined,
   users: { 
   }
 };

const getBoard = async (client, board) => {
   
   const result = await client.get(board);
   return JSON.parse(result);
}

const setBoard = async (client, board, boardState) => {
   await client.set(board, JSON.stringify(boardState));
}

const getClient = async () => {
   if ( global.client === undefined ) {
      const { createClient } = await import("redis");

      global.client = createClient({ url: process.env.REDIS_URL });

      global.client.on('error', err => console.log('Redis Client Error', err));

      await global.client.connect();
   }
   return global.client;
}

const validateBoardId = (boardId) => {
   /**
    * alphanumeric and less than 32 characters
    */
   if (boardId === undefined) {
      // TODO: error
   }
   // /^[a-z0-9]+$/i TODO finish validating boardId
   return true;
}

const router = express.Router();
router.get("/", async (req, res) => {
  res.json({
    status: "alive"
  });
});

router.get("/estimation", async (req, res) => {
   const boardId = req.query.board;
   validateBoardId(boardId);
   // TODO DRY OUT
   state = await getBoard(await getClient(), boardId);
   if (state === undefined || state === null || Object.keys(state).length == 0) {
      state = INIT_STATE;
      await setBoard(await getClient(), boardId, state);
   }
   res.send(state);
});

router.put("/show_estimations", async (req, res) => {
   const boardId = req.query.board;
   validateBoardId(boardId);
   state = await getBoard(await getClient(), boardId);

   state.showEstimations = req.body.showEstimations;
   
   await setBoard(global.client, boardId, state);
      
   res.send({status: "OK"});
});

router.delete("/estimate", async(req, res) => {
   const boardId = req.query.board;
   validateBoardId(boardId);
   state = await getBoard(await getClient(), boardId);
   
   const newUsers = {...state.users};
   for (let user in newUsers) {
      newUsers[user] = {
         "id": newUsers[user]["id"],
      };
   }
   state.users = newUsers;
   state.lastClearTimestamp = Date.now();
   await setBoard(global.client, boardId, state);
   res.send({status: "OK"});
})

router.put("/estimate", async (req, res) => {
   const boardId = req.query.board;
   validateBoardId(boardId);
   state = await getBoard(await getClient(), boardId);
   //TODO how to handle a missing board?

   // Example req body: {user: user, newScore: newScore, "effort": level})
   const {id, user, newScore, effort, risk, complexity} = req.body;
   if (state["users"].length === 0 || !(user in state["users"])) {
      // if the user does not exist yet
      state["users"][user] = {}
   }
   if (id) {
      // @todo Note: this is pretty silly to use the username as the primary key instead of the id; 
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

   await setBoard(global.client, boardId, state);
   res.send({status: "OK"})
})

router.put("/user", async (req, res) => {
   
   const boardId = req.query.board;
   validateBoardId(boardId);
   // TODO DRYOUT
   state = await getBoard(await getClient(), boardId);
   if (state === undefined || state === null || Object.keys(state).length == 0) {
      state = INIT_STATE;
   }
   
   // Example req body: {user: user, newScore: newScore, "effort": level})
   const {user, newUsername} = req.body;
   const newUsers = {...state["users"]};
   const oldlocalUser = user;
   const oldUserData = {...newUsers[oldlocalUser]};
   
   if (oldUserData !== undefined) {
      // (2) updates the users object use the new name as the key 
      delete newUsers[oldlocalUser];
      newUsers[newUsername] = oldUserData;
      state["users"] = newUsers;
   }
   await setBoard(global.client, boardId, state);
   res.send({status: "OK"});
})


app.use(router);
var server = app.listen(5000, function () {
   console.log("Express App running at http://127.0.0.1:5000/");
})