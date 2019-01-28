import React from "react";
import { ThemeProvider, Loader } from "rimble-ui";
import { DrizzleContext } from "drizzle-react";

import Background from "./components/Background";
import DonationForm from "./components/DonationForm";

const App = () => {
  return (
    <ThemeProvider style={{ height: "100%" }}>
      <Background>
        <DonationForm />
      </Background>
    </ThemeProvider>
  );
};

export default () => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { initialized } = drizzleContext;

      if (!initialized) {
        return (
          <Loader
            style={{
              margin: "auto"
            }}
            size="100px"
          />
        );
      }

      return <App />;
    }}
  </DrizzleContext.Consumer>
);
