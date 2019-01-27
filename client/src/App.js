import React, { useState } from "react";
import { ThemeProvider, Loader } from "rimble-ui";
import { DrizzleContext } from "drizzle-react";

import CharityDropDown from "./components/CharityDropDown";
import Background from "./components/Background";

const App = () => {
  const [charityName, setCharityName] = useState();
  return (
    <ThemeProvider style={{ height: "100%" }}>
      <Background>
        <CharityDropDown
          charityName={charityName}
          setCharityName={e => setCharityName(e.target.value)}
        />
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
