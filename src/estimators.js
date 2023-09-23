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
    return 1;
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

const deleteUrl = (url, body) => {
    (async () => {
        await fetch(url, 
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                  },
                body: JSON.stringify(body)
            })
    })();
};

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

/**
 * Update the level (low,med,high) of a given shard in the state and update the backend to the change
 * 1.) Update the shard  (complexity, effort, risk) to the next level (low, med, high)
 * 2.) calculate the new score
 * 3.) Update the backend with the new shard level and score for the given user
 */
const updateLevel = (shard, user, level, state) => {
    // 1.) Update the shard  (complexity, effort, risk) to the next level (low, med, high)
    state["users"][user][shard] = level; 
    const {risk, complexity, effort} = state["users"][user];
    // 2.) calculate the new score
    const newScore = calculateScore({risk, complexity, effort})
    state["users"][user]["score"] = newScore;
    // Update the id in the backend; ok with this since the localuser row is owned by the local user (it's source of truth is local)
    // 3.) Update the backend with the new shard level and score for the given user
    const updateToBackend = {id: state["users"][user].id,  user: user, newScore: newScore};
    updateToBackend[shard] = level;
    put(backendUrl("estimate"), updateToBackend); 
    return state;
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
         * (4) update the backend with the new username
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
    
        // (3) update localStorage to have the new username, which is picked up on slice init
        setLocalStageWithExpiry(ESTIMATION_BOARD_LOCALSTORAGE_USERNAME, name, 360000);

        // (4) update the backend with the new username
        // usecase here; updating an existing username breaks
        put(backendUrl("user"), {id: oldUserData.id, user: oldlocalUser, newUsername: name});
        return {
            ...state,
            localUser: name, // (1) localUser name
            users: newUsers,
        }
    },
    clear: (state, action) => {
        /**
         * (1) clear localUser row
         * (2) call DELETE /estimate
         * (3) update against the server
         */
        // (1) clear localUser row
        const newUsers = {...state["users"]};
        const localUsername = state["localUser"];
        newUsers[localUsername] = {"id": newUsers[localUsername]["id"]};

        // (2) call DELETE /estimate
        deleteUrl(backendUrl("estimate"));

        // (3) update against the server
        // TODO: ...? necessary or just clear it locally myself
        
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
        return updateLevel("complexity", user, level, state);
    },
    updateEffort: (state, action) => {
        const [user, level] = action.payload;
        return updateLevel("effort", user, level, state);
    },
    updateRisk: (state, action) => {
        const [user, level] = action.payload;
        return updateLevel("risk", user, level, state);
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