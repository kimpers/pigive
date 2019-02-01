import React from "react";
import ReactDOM from "react-dom";
import { Drizzle, generateStore } from "drizzle";
import { DrizzleContext } from "drizzle-react";
import { ToastContainer } from "react-toastify";
import YOTPBadge from "./contracts/YOTPBadge.json";
import Charities from "./contracts/Charities.json";
import DonationManager from "./contracts/DonationManager.json";

import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

const CONTRACT_DEPLOYMENT_BLOCK =
  process.env.REACT_APP_CONTRACT_DEPLOYMENT_BLOCK || 0;

const options = {
  contracts: [YOTPBadge, Charities, DonationManager],
  events: {
    Charities: [
      {
        eventName: "LogCharityAdded",
        eventOptions: { fromBlock: CONTRACT_DEPLOYMENT_BLOCK }
      },
      {
        eventName: "LogCharityRemoved",
        eventOptions: { fromBlock: CONTRACT_DEPLOYMENT_BLOCK }
      }
    ]
  },
  polls: { accounts: 1500 }
};

const drizzleStore = generateStore(options);
const drizzle = new Drizzle(options, drizzleStore);

ReactDOM.render(
  <DrizzleContext.Provider drizzle={drizzle}>
    <App />
    <ToastContainer
      position="top-right"
      autoClose={5000}
      closeOnClick
      pauseOnVisibilityChange
      draggable
      pauseOnHover
      closeButton={false}
      style={{
        textAlign: "center"
      }}
    />
  </DrizzleContext.Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
