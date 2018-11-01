import TestInstancesGriddleAdapter from '../shared/adapter/TestInstancesGriddleAdapter';
import $ from 'jquery';

export function filteringTestsStarted(state, action){

    $(".griddle-page-select").hide()

    let newState = {
        ...state,
        showLoading: true
    };

    return newState;
}

export function filteringTestsFinished(state, action){

    let adapter = new TestInstancesGriddleAdapter(action.scores)

    $(".griddle-page-select").show()

    let newState = {
        ...state,
        showLoading: false,
        data: adapter.getGriddleData()
    }

    return newState;
}