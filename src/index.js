import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import { store, persistor } from './store/configureStore';
import AppRouter from './containers/AppRouter'


const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </PersistGate>
  </Provider>
)
