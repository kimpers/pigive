import React, { useState } from "react";
import { ThemeProvider, Heading, Loader } from "rimble-ui";
import { DrizzleContext } from "drizzle-react";

import CharityDropDown from "./components/CharityDropDown";

const App = () => {
  const [charityName, setCharityName] = useState();
  return (
    <ThemeProvider>
      <div>
        <Heading.h1>YOTP</Heading.h1>
        <CharityDropDown
          charityName={charityName}
          setCharityName={e => setCharityName(e.target.value)}
        />
      </div>
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
