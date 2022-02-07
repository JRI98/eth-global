import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider } from "@chakra-ui/react";
import { MoralisProvider } from "react-moralis";
import { useMoralis } from "react-moralis";

ReactDOM.render(
  <ChakraProvider>
    <MoralisProvider
      appId="mHeQZ1pIlgGzZAMXFVsWJYfDEIaCP5WCYEjmzcKk"
      serverUrl="https://bwe5lyfgdni0.usemoralis.com:2053/server"
    >
      <App />
    </MoralisProvider>
  </ChakraProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
