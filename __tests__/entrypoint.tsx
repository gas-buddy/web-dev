/* global window */
import {
  React, entryPoint, RouterThunk, combineReducers,
} from '@gasbuddy/react';

// Global styles for admin
import './test.css';

const routes = {
  // @ts-ignore
  routes: [{ component: () => (<div />), path: '//' }],
};

const Router = RouterThunk(routes);
// @ts-ignore
const appReducer = combineReducers({ conf: (s) => (s || {}) });

const render = () => entryPoint({
  reducers: appReducer,
  router: Router,
  // @ts-ignore
  initialState: window.PreloadedState,
});

render();
