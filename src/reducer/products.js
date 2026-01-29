import { RETRIEVE_PRODUCTS_SUCCESS } from '../actions/products';
import initialState from '../store/initialState';

const products = (state = initialState.products, action) => {
  switch (action.type) {
    case RETRIEVE_PRODUCTS_SUCCESS:
      return {
        ...state,
        list: action.products
      };

    default:
      return state;
  }
};

export default products;
