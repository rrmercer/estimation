const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('./logger.js');

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
      logger.log({
         level: 'info',
         message: 'Creating a new redis connect'
       });
      const { createClient } = await import("redis");

      global.client = createClient({ url: process.env.REDIS_URL });

      global.client.on('error', err => 
         logger.log({
            level: 'error',
            message: `Redis Client Error ${err}`
         })
      );

      await global.client.connect();
   }
   return global.client;
}

const validateBoardId = (boardId) => {
   /**
    * alphanumeric and less than 32 characters
    */
   if (boardId === undefined) {
      return false;
   }
   
   return /^[a-zA-Z0-9]+$/.test(boardId) && boardId.length >= 4 && boardId.length <= 32;
}

const router = express.Router();
router.get("/", async (req, res) => {
  res.json({
    status: "alive"
  });
});

const validateBoardOrNext = (req, res) => {
   const boardId = req.query.board;
   if (!validateBoardId(boardId)) {
      res.status(400).send("Invaid board ID! Must be alphanumeric and between 4 and 32 chars");
      next();
   }
}

router.get("/estimation", async (req, res, next) => {
   try {
      const boardId = req.query.board;
      validateBoardOrNext(req, res);
      
      // TODO DRY OUT
      state = await getBoard(await getClient(), boardId);
      if (state === undefined || state === null || Object.keys(state).length == 0) {
         state = INIT_STATE;
         await setBoard(await getClient(), boardId, state);
      }
      res.send(state);
   } catch (err) {
      next(err);
   }
});

router.put("/show_estimations", async (req, res, next) => {
   try {
      const boardId = req.query.board;
      validateBoardOrNext(req, res);
      state = await getBoard(await getClient(), boardId);

      state.showEstimations = req.body.showEstimations;
      
      await setBoard(global.client, boardId, state);
         
      res.send({status: "OK"});
   } catch (err) {
      next(err);
   }
});

router.delete("/estimate", async(req, res) => {
   try {
      const boardId = req.query.board;
      validateBoardOrNext(req, res);
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
   } catch (err) {
      next(err);
   }
})

router.put("/estimate", async (req, res) => {
   try {
      const boardId = req.query.board;
      validateBoardOrNext(req, res);
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
      res.send({status: "OK"});
   } catch (err) {
      next(err);
   }
})

router.put("/user", async (req, res) => {
   try {
      const boardId = req.query.board;
      validateBoardOrNext(req, res);
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
   } catch (err) {
      next(err);
   }
})


function errorHandler (err, req, res, next) {
   const errorData = {
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
      stack: err.stack,
      };
      logger.log({
         level: 'error',
         message: `An unexpected error occured : ${JSON.stringify(errorData)}`
       });
   res.status(500).send('Internal Server Error!'); // Users will see this
}

 const notFoundHandler = (req, res, next) => {
   res.status(404).json({
         error: 404,
         message: "Route not found."
      })
   }

app.use(router);
app.use(errorHandler);
app.use(notFoundHandler);
app.disable('x-powered-by');
var server = app.listen(5000, function () {
   console.log("Express App running at http://127.0.0.1:5000/");
})