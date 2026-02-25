import {routerReducer} from 'react-router-redux';
import {combineReducers} from 'redux';
import login from './login';
import users from './users'
import products from './products';
import dashboard from './dashboard';

const rootReducer = combineReducers({
  routing: routerReducer,
  login,
  users,
  products,
  dashboard
});

export default rootReducer;