/* global window */
import { React, entryPoint, RouterThunk, combineReducers } from '@gasbuddy/react';

// Global styles for admin
import './test.css';

const routes = {
  routes: [{ component: () => (<div />), path: '//' }],
};

const Router = RouterThunk(routes);
const appReducer = combineReducers({ conf: s => (s || {}) });

const render = () => entryPoint({
  reducers: appReducer,
  router: Router,
  initialState: window.PreloadedState,
});

render();

if (module.hot) {
  module.hot.accept('./entrypoint', render);
}
