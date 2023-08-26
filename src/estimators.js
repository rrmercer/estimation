import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid';
import backendUrl from './utils.js';

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
  
export const estimatorsSlice = createSlice({
  name: 'estimators',
  initialState: {
    showEstimations: true,
    localUser: "rob",
    users: {}
  },
  reducers: {
    setInitialUsers: (state, action) => {
        const [result] = action.payload;
        return {
            ...state,
            users: result["users"],
        }
    },
    updateLocalUserName: (state, action) => {
        /**
         * Updates the name in two places:
         * (1) localUser name and...
         * (2) updates the users object use the new name as the key
         * Example: name="bob" (replacing "rob")
         * {localUser: "bob", users: {"bob": {...}}}
         */
        const [name] = action.payload;  
        const newUsers = {...state["users"]};
        const oldlocalUser = state["localUser"];
        const oldUserData = {...newUsers[oldlocalUser]};
        delete newUsers[oldlocalUser];
        newUsers[name] = oldUserData
        return {
            ...state,
            localUser: name,
            users: newUsers,
        }
    },
    clear: (state, action) => {
        const users = state["users"];
        const newUsers = {...users};
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
        (async () => {
            await fetch(backendUrl("show_estimations"), 
                {
                    method: "PUT",
                    body: JSON.stringify({showEstimations: true})
                })
        })();
        return {
            ...state,
            showEstimations: true,
        };
    },
    hideEstimations: (state, action) => {
        (async () => {
            await fetch(backendUrl("show_estimations"), 
                {
                    method: "PUT",
                    body: JSON.stringify({showEstimations: false})
                })
        })();
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

        return state;
    },
    updateEffort: (state, action) => {
        const [user, level] = action.payload;
        //TODO: dont modify the state directly here
        const {risk, complexity } = state["users"][user];
        state["users"][user]["effort"] = level;
        const newScore = calculateScore({risk, complexity, effort: level})
        state["users"][user]["score"] = newScore;

        return state;
    },
    updateRisk: (state, action) => {
        const [user, level] = action.payload;
        //TODO: dont modify the state directly here
        const {complexity, effort} = state["users"][user];
        state["users"][user]["risk"] = level;
        state["users"][user]["score"] = calculateScore({risk: level, complexity, effort});
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
const { updateComplexity, updateRisk, updateEffort, updateLocalUserName, setInitialUsers, showEstimations, hideEstimations, clear } = estimatorsSlice.actions
export { updateComplexity, updateRisk, updateEffort, updateLocalUserName, setInitialUsers, selectUsers, selectLocalUser, selectShowEstimations, showEstimations, hideEstimations, clear};

export default estimatorsSlice.reducer