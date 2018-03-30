/* global window */
import 'babel-polyfill';
import { React, entryPoint, RouterThunk, combineReducers } from '@gasbuddy/react';
import { hot } from '../hot';

// Global styles for admin
import './test.css';

const routes = {
  routes: [{ component: () => (<div />), path: '//' }],
};

const Router = RouterThunk(routes);
const appReducer = combineReducers({ conf: s => (s || {}) });

const render = () => entryPoint({
  reducers: appReducer,
  router: hot(module)(Router),
  initialState: window.PreloadedState,
});

render();
