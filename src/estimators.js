import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';
import backendUrl from './utils.js';
import {getFromLocalWithExpiry, setLocalStageWithExpiry} from './local-storage.js';

const levelToInt = (level) => {
    if (level === "low") {
      return 1;
    }
    if (level === "medium") {
      return 2;
    }
    if (level === "high") {
      return 3;
    }
    return 1;// TODO: remove? how to handle if the user has not put in one of the three levels?
}
/**
 * 
 * @param {} start 
 * @returns 
 */
const nextFib = (start) => {
const fib = [1,2,3,5,8,13];
for (let i = 0; i < fib.length; i++) {
    if (start <= fib[i]) {
    return fib[i];
    }
}
return 13;
}

const calculateScore = ({risk, complexity, effort}) => {
    const intComplexity = levelToInt(complexity);
    const intEffort = levelToInt(effort);

    if (risk === "low") {
    return nextFib(intComplexity + intEffort - 1);
    }
    if (risk === "medium") {
    return nextFib(1 + nextFib(intComplexity + intEffort - 1)); // take the -1 off here?
    } 
    if (risk === "high") {
    return nextFib(1+ nextFib(1 + nextFib(1 + nextFib(intComplexity + intEffort - 1))));
    }
}

const put = (url, body) => {
    (async () => {
        await fetch(url, 
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                  },
                body: JSON.stringify(body)
            })
    })();
}
const ESTIMATION_BOARD_LOCALSTORAGE_USERNAME = "estimationBoard/localUser";

const generateinitUsers = () => {
    // generates a row with the user name from local storage if one is found
    const initUser = {};
    const existingLocalUser = getFromLocalWithExpiry(ESTIMATION_BOARD_LOCALSTORAGE_USERNAME);
    initUser[existingLocalUser] = {
        "risk": "",
        "complexity": "",
        "effort": "",
        "score": "",
        "id": uuidv4(),
    }
    
    return initUser;
}

export const estimatorsSlice = createSlice({
  name: 'estimators',
  initialState: {
    showEstimations: true,
    localUser: getFromLocalWithExpiry(ESTIMATION_BOARD_LOCALSTORAGE_USERNAME),
    users: generateinitUsers()
  },
  reducers: {
    updateFromBackend: (state, action) => {
        const [result] = action.payload;
        const localUser = state.localUser;
        let newUsers = {...result["users"]};
        // dont overwrite localUser
        if (localUser !== "") {
            newUsers[localUser] = {...state["users"][localUser]};           
        }
        
        return {
            ...state,
            showEstimations: result["showEstimations"],
            users: {
                ...newUsers
            }
        }
    },
    updateLocalUserName: (state, action) => {
        /**
         * Updates the name in two places:
         * (1) localUser name and...
         * (2) updates the users object use the new name as the key 
         * (3) update localStorage to have the new username, which is picked up on slice init
         * Example: name="bob" (replacing "rob")
         * {localUser: "bob", users: {"bob": {...}}}
         */
        const [name] = action.payload;  
        const newUsers = {...state["users"]};
        const oldlocalUser = state["localUser"];
                
        // (2) updates the users object use the new name as the key 
        const oldUserData = {...newUsers[oldlocalUser]};
        delete newUsers[oldlocalUser];
        newUsers[name] = oldUserData;
    
        console.log(`update localusername ${JSON.stringify(newUsers)}`);
        // (3) update localStorage to have the new username, which is picked up on slice init
        setLocalStageWithExpiry(ESTIMATION_BOARD_LOCALSTORAGE_USERNAME, name, 360000);
        return {
            ...state,
            localUser: name, // (1) localUser name
            users: newUsers,
        }
    },
    clear: (state, action) => {
        const users = state["users"];
        const newUsers = {...users};
        // TODO: wrong; tell the backend to delete its data
        Object.entries(users).forEach((userName, user) => {
            const empty = {
                "risk": "",
                "complexity": "",
                "effort": "",
                "score": "",
                "id": uuidv4(),
            };
            newUsers[userName[0]] = {...empty};
        });
        return {...state, users: newUsers};
    },
    showEstimations: (state, action) => {
        put(backendUrl("show_estimations"), {showEstimations: true});
        return {
            ...state,
            showEstimations: true,
        };
    },
    hideEstimations: (state, action) => {
        put(backendUrl("show_estimations"), {showEstimations: false});
        return {
            ...state,
            showEstimations: false,
        };
    },
    updateComplexity: (state, action) => {
        const [user, level] = action.payload;
        //TODO: dont modify the state directly here; DRY THESE OUT!!
        const {risk, effort} = state["users"][user];
        state["users"][user]["complexity"] = level;
        const newScore = calculateScore({risk, complexity: level, effort})
        state["users"][user]["score"] = newScore;
        // Update the id in the backend; ok with this since the localuser row is owned by the local user (it's source of truth is local)
        put(backendUrl("estimate"), {id: state["users"][user].id,  user: user, newScore: newScore, "complexity": level}); 

        return state;
    },
    updateEffort: (state, action) => {
        const [user, level] = action.payload;
        //TODO: dont modify the state directly here
        const {risk, complexity } = state["users"][user];
        state["users"][user]["effort"] = level;
        const newScore = calculateScore({risk, complexity, effort: level})
        state["users"][user]["score"] = newScore;
        put(backendUrl("estimate"), {id: state["users"][user].id, user: user, newScore: newScore, "effort": level}); 

        return state;
    },
    updateRisk: (state, action) => {
        const [user, level] = action.payload;
        //TODO: dont modify the state directly here
        const {complexity, effort} = state["users"][user];
        state["users"][user]["risk"] = level;
        const newScore = calculateScore({risk: level, complexity, effort});
        state["users"][user]["score"] = newScore;
        put(backendUrl("estimate"), {id: state["users"][user].id, user: user, newScore: newScore, "risk": level}); 
        return state;
    },
  },
})

function selectUsers(state) {
    return state.estimator.users;
}
const selectShowEstimations = (state) => state.estimator.showEstimations;
const selectLocalUser = (state) => state.estimator.localUser;
    

// Action creators are generated for each case reducer function
const { updateComplexity, updateRisk, updateEffort, updateLocalUserName, updateFromBackend, showEstimations, hideEstimations, clear } = estimatorsSlice.actions
export { updateComplexity, updateRisk, updateEffort, updateLocalUserName, updateFromBackend, selectUsers, selectLocalUser, selectShowEstimations, showEstimations, hideEstimations, clear};

export default estimatorsSlice.reducer