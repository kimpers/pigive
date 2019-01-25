import React, { Component } from "react";
import idx from "idx";
import { ThemeProvider, Heading } from "rimble-ui";
import { DrizzleContext } from "drizzle-react";

class App extends Component {
  constructor(props) {
    super(props);
    const { drizzle } = props;
    const { Charities } = drizzle.contracts;
    const charityKey = Charities.methods.getCharityAddressByName.cacheCall(
      "InternetArchive"
    );

    this.state = {
      charityKey
    };
  }

  render() {
    const { drizzleState } = this.props;
    const { Charities } = drizzleState.contracts;
    const { charityKey } = this.state;
    const charityAddress = idx(
      Charities,
      _ => _.getCharityAddressByName[charityKey].value
    );

    return (
      <ThemeProvider>
        <div>
          <Heading.h1>{charityAddress}</Heading.h1>
        </div>
      </ThemeProvider>
    );
  }
}

export default () => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzle, drizzleState, initialized } = drizzleContext;

      if (!initialized) {
        return "Loading...";
      }

      return <App drizzle={drizzle} drizzleState={drizzleState} />;
    }}
  </DrizzleContext.Consumer>
);
