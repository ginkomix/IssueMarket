import React from 'react';
import ReactDOM from 'react-dom';
import {
  hashHistory,
  IndexRoute,
  Route,
  Router,
} from 'react-router';

import { Provider } from 'react-redux';
import store from './config/store';

const Layout = ({
  children,
}) => (
    <div className="app">
      {children}
    </div>
  );

const App = () => (
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route exact path="/" component={Layout}>
        <IndexRoute component={PageMain} />
        <Route exact path="/admin" component={PageAdmin} />
      </Route>
    </Router>
  </Provider>
);

ReactDOM.render(<App />, document.getElementById('react-content'));

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}
