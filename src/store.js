import { configureStore } from '@reduxjs/toolkit'
import estimatorsReducer from './estimators'

export default configureStore({
  reducer: {
    estimator: estimatorsReducer,
  },
})