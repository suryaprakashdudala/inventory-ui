import { GET_DASHBOARD_STATS_SUCCESS } from '../actions/dashboard';
import initialState from '../store/initialState';


const dashboardReducer = (state = initialState.dashboard, action) => {
    switch (action.type) {
        case GET_DASHBOARD_STATS_SUCCESS:
            return {
                ...state,
                stats: action.payload
            };
        default:
            return state;
    }
};

export default dashboardReducer;
