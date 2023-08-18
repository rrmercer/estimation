import { createSlice } from '@reduxjs/toolkit'

export const estimatorsSlice = createSlice({
  name: 'estimators',
  initialState: {
    users: { 
            "rob": {
                "risk": "low",
                "complexity": "medium",
                "effort": "high"
            }
        }
  },
  reducers: {
    updateComplexity: (state, action) => {
        const [user, level] = action.payload;
        //TODO: dont modify the state directly here
        state["users"][user]["complexity"] = level;
        return state;
    },
    updateRisk: (state, action) => {
        const [user, level] = action.payload;
        //TODO: dont modify the state directly here
        state["users"][user]["risk"] = level;
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