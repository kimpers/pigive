import React from "react";
import { DrizzleContext } from "drizzle-react";
import { Select } from "rimble-ui";

const filterActiveCharities = allEvents => {
  const charitiyAddedEvents = allEvents.filter(
    e => e.event === "LogCharityAdded"
  );
  const removedCharities = new Set(
    allEvents.filter(e => e.event === "LogCharityRemoved")
  );

  return charitiyAddedEvents
    .filter(e => !removedCharities.has(e.event))
    .map(c => c.returnValues);
};

const CharityDropDown = ({ charityName, setCharityName }) => {
  return (
    <DrizzleContext.Consumer>
      {drizzleContext => {
        const { drizzleState } = drizzleContext;
        const { Charities } = drizzleState.contracts;

        const activeCharities = filterActiveCharities(Charities.events);

        // Wait for event logs
        if (!activeCharities.length) {
          return null;
        }

        return (
          <Select
            items={activeCharities.map(e => e.name)}
            value={charityName}
            onChange={setCharityName}
          />
        );
      }}
    </DrizzleContext.Consumer>
  );
};

export default CharityDropDown;
