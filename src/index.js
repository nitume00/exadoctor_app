/* global __DEV__ */
import React from 'react';
import {connect, Provider} from 'react-redux';
import {legacy_createStore as createStore, applyMiddleware} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
// import thunk from 'redux-thunk';
import {thunk} from 'redux-thunk';
import rootReducer from '@reduxx/index'; // Ensure this is the correct path to your rootReducer
import {Router} from 'react-native-router-flux';
import {AppStyles} from '@theme/';
import AppRoutes from '@navigation/';

const RouterWithRedux = connect()(Router);

let middleware = [thunk]; // Start with the thunk middleware

if (__DEV__) {
  // Add logger middleware in development environment
  const {createLogger} = require('redux-logger');
  const logger = createLogger();
  middleware = [...middleware, logger];
}

// Ensure that middleware is always an array
if (!Array.isArray(middleware)) {
  middleware = [middleware];
}

// Apply middleware and create the store
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middleware)),
);
export default function AppContainer() {
  return (
    <Provider store={store}>
      <RouterWithRedux scenes={AppRoutes} style={AppStyles.appContainer} />
    </Provider>
  );
}
