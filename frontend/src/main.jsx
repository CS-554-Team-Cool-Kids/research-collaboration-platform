import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/main.css";

import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";

import fbconfig from "./firebase/firebaseConfig";
import { initializeApp } from "firebase/app";

import { AuthProvider } from "./context/AuthContext.jsx";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: `http://${import.meta.env.VITE_GRAPHQL_IP}:${
      import.meta.env.VITE_GRAPHQL_PORT
    }`,
  }),
});
const app = initializeApp(fbconfig);

createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </ApolloProvider>
);
