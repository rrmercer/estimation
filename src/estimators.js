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
  }
  // 12 -> 13
  // 4 -> 5
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

      console.log(` nextFib(2) = ${ nextFib(2)}`);
      console.log(nextFib(1 + nextFib(2)));
  
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
        const newScore = calculateScore({risk: level, complexity, effort});
        console.log(`newScore ${level} ${complexity} ${effort} ${newScore}`);
        state["users"][user]["score"] = newScore;
        return state;
    },
  },
})

function selectUsers(state) {
    return state.estimator.users;
}

// Action creators are generated for each case reducer function
const { updateComplexity, updateRisk } = estimatorsSlice.actions
export { updateComplexity, updateRisk, selectUsers };

export default estimatorsSlice.reducer