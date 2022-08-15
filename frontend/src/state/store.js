import sagas from "./sagas";
import createSagaMiddleware from "redux-saga";
import reducers from "./reducers";
import { applyMiddleware, compose, createStore } from "redux";

const sagasMiddlware = createSagaMiddleware();

const composeEnhancers =
  (process.env.NODE_ENV !== "production" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const store = composeEnhancers
  ? createStore(reducers, composeEnhancers(applyMiddleware(sagasMiddlware)))
  : createStore(reducers);

export default store;

sagasMiddlware.run(sagas);
