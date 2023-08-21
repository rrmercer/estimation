import { createSlice } from '@reduxjs/toolkit'


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

      //console.log(` nextFib(2) = ${ nextFib(2)}`);
      //console.log(nextFib(1 + nextFib(2)));
  
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
    users: { 
            "rob": {
                "risk": "low",
                "complexity": "medium",
                "effort": "high",
                "score": 5
            },
            "john": {
                "risk": "low",
                "complexity": "medium",
                "effort": "high",
                "score": 5
            }
        }
  },
  reducers: {
    clear: (state, action) => {
        const users = state["users"];
        const newUsers = {...users};
        Object.entries(users).forEach((userName, user) => {
            const empty = {
                "risk": "",
                "complexity": "",
                "effort": "",
                "score": ""
            };
            newUsers[userName[0]] = {...empty};
        });
        return {...state, users: newUsers};
    },
    showEstimations: (state, action) => {
        return {
            ...state,
            showEstimations: true,
        };
    },
    hideEstimations: (state, action) => {
        return {
            ...state,
            showEstimations: false,
        };
    },
    updateComplexity: (state, action) => {
        const [user, level] = action.payload;
        //TODO: dont modify the state directly here
        const {risk, complexity, effort} = state["users"][user];
        state["users"][user]["complexity"] = level;
        state["users"][user]["score"] = calculateScore({risk, complexity: level, effort});
        return state;
    },
    updateRisk: (state, action) => {
        const [user, level] = action.payload;
        //TODO: dont modify the state directly here
        const {risk, complexity, effort} = state["users"][user];
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
    

// Action creators are generated for each case reducer function
const { updateComplexity, updateRisk, showEstimations, hideEstimations, clear } = estimatorsSlice.actions
export { updateComplexity, updateRisk, selectUsers, selectShowEstimations, showEstimations, hideEstimations, clear};

export default estimatorsSlice.reducer