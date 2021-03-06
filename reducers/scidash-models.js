import {
  FILTERING_MODELS_STARTED,
  FILTERING_MODELS_FINISHED,
  DATE_FILTER_CHANGED,
  DATE_FILTER_CLEAR,
  MODEL_CREATE_FINISHED,
  MODEL_CLONE_FINISHED,
  MODEL_EDIT_FINISHED
} from "../actions/creators/models";
import {
  filteringModelsStarted,
  filteringModelsFinished,
  dateFilterChanged,
  dateFilterClear,
  modelCreateFinished,
  modelCloneFinished,
  modelEditFinished
} from "../actions/models";

export default function scidashModels (state = {}, action){

  let newState = null;

  switch (action.type){
  case DATE_FILTER_CLEAR:
    newState = {
      ...dateFilterClear(state, action)
    };
    break;
  case DATE_FILTER_CHANGED:
    newState = {
      ...dateFilterChanged(state, action)
    };
    break;
  case FILTERING_MODELS_STARTED:
    newState = {
      ...filteringModelsStarted(state, action)
    };
    break;
  case FILTERING_MODELS_FINISHED:
    newState = {
      ...filteringModelsFinished(state, action)
    };
    break;
  case MODEL_CREATE_FINISHED:
    newState = {
      ...modelCreateFinished(state, action)
    };
    break;
  case MODEL_CLONE_FINISHED:
    newState = {
      ...modelCloneFinished(state, action)
    };
    break;
  case MODEL_EDIT_FINISHED:
    newState = {
      ...modelEditFinished(state, action)
    };
    break;
  default:
    newState = {
      ...state,
    };
    break;
  }

  return newState;
}
