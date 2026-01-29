import {routerReducer} from 'react-router-redux';
import {combineReducers} from 'redux';
import login from './login';
import users from './users'
import products from './products';

const rootReducer = combineReducers({
  routing: routerReducer,
  login,
  users,
  products
});

export default rootReducer;