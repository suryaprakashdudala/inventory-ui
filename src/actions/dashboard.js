import api from '../api/api';

export const GET_DASHBOARD_STATS_SUCCESS = 'GET_DASHBOARD_STATS_SUCCESS';

export const getDashboardStats = () => async (dispatch) => {
    try {
        const response = await api.get('/dashboard/stats');
        dispatch({
            type: GET_DASHBOARD_STATS_SUCCESS,
            payload: response.data
        });
        return response;
    } catch (error) {
        throw error;
    }
};
