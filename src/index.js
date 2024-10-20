import React from 'react';
import App from './App';
import { hydrate, render } from "react-dom";
import ReactDOM from "react-dom";

if (false) {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  const rootElement = document.getElementById("root");
  if (rootElement.hasChildNodes()) {
    hydrate(<App />, rootElement);
  } else {
    render(<App />, rootElement);
  }

}


