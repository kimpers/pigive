import React from "react";
import { ThemeProvider } from "rimble-ui";

import LoadingContainer from "./components/LoadingContainer";
import Background from "./components/Background";
import DonationForm from "./components/DonationForm";

const App = () => {
  return (
    <ThemeProvider style={{ height: "100%" }}>
      <Background>
        <LoadingContainer>
          <DonationForm />
        </LoadingContainer>
      </Background>
    </ThemeProvider>
  );
};

export default App;
