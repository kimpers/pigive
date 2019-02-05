import React from "react";
import { DrizzleContext } from "drizzle-react";
import styled from "styled-components";
import { Heading, Text, Loader } from "rimble-ui";

import { device } from "../constants";

const LoadingHeader = styled(Heading.h1)`
  text-align: center;
`;

const LoadingMessage = styled(Text)`
  text-align: center;
`;
const MainContainer = styled.div`
  margin: 100px 50px;

  @media ${device.mobile} {
    margin: 0 20px;
  }
`;

const LoadingContainer = ({ children, ...rest }) => {
  if (!window.web3) {
    return (
      <MainContainer>
        <LoadingHeader>
          <span role="img" aria-label="Fox head">
            🦊
          </span>{" "}
          MetaMask not found{" "}
          <span role="img" aria-label="Fox head">
            🦊
          </span>
        </LoadingHeader>
        <LoadingMessage>
          Please make sure you have{" "}
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            MetaMask
          </a>{" "}
          installed or use a Web3 compatible browser
        </LoadingMessage>
      </MainContainer>
    );
  }

  return (
    <DrizzleContext.Consumer>
      {drizzleContext => {
        const { initialized } = drizzleContext;

        if (!initialized) {
          return (
            <MainContainer>
              <Loader
                style={{
                  margin: "auto",
                  color: "#aa381e"
                }}
                size="100px"
              />
              <LoadingMessage style={{ fontWeight: "bold" }}>
                Loading PiGive...
              </LoadingMessage>
              <LoadingMessage>
                If stuck on this screen make sure that you have{" "}
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MetaMask
                </a>{" "}
                installed and and connected
              </LoadingMessage>
            </MainContainer>
          );
        }

        return React.Children.map(children, child =>
          React.cloneElement(child, {
            ...rest
          })
        );
      }}
    </DrizzleContext.Consumer>
  );
};

export default LoadingContainer;
