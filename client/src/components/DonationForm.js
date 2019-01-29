import React, { useState } from "react";
import styled from "styled-components";
import { Heading, Text, Input, Button, Select } from "rimble-ui";

import CharityDropDown from "./CharityDropDown";
import { device } from "../constants";

const FormSelect = styled(Select)`
  color: #333;
`;

const FormWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding 15px;

  @media ${device.mobile} {
    background-color: #fff8f0;
  }

`;

const FormRow = styled.div`
  display: flex;
  flex-direction: row;
  margin: 15px 0;
`;

const FormHeading = styled(Heading.h2)`
  text-align: center;
  padding-top: 10px;
  color: #333;
`;

const FormText = styled(Text.span)`
  color: #333;
  margin-left: 10px;
  align-self: center;
`;

const FormInput = styled(Input)`
  color: #333;
`;

const DonateButton = styled(Button)`
  background-color: #d1ccc9;
  color: #333;

  :hover {
    background-color: white;
  }
`;

const ContentBox = styled.div`
  display: inline-block;
  align-self: center;
`;

const donationLevelMapping = {
  Gold: 1,
  Silver: 0.1,
  Bronze: 0.01
};

const DonationForm = () => {
  const [charityName, setCharityName] = useState();
  const [donationLevel, setDonationLevel] = useState("Bronze");
  const donationAmount = donationLevelMapping[donationLevel] || "Bronze";

  return (
    <FormWrapper>
      <ContentBox>
        <FormHeading>Donate to receive your collectible</FormHeading>
        <FormRow>
          <CharityDropDown
            charityName={charityName}
            setCharityName={e => setCharityName(e.target.value)}
          />
          <FormText>Charity to donate to</FormText>
        </FormRow>
        <FormRow>
          <FormSelect
            items={["Bronze", "Silver", "Gold"]}
            value={donationLevel}
            onChange={e => setDonationLevel(e.target.value)}
          />
          <FormText>Select donation level</FormText>
        </FormRow>
        <FormRow>
          <FormInput
            type="number"
            step={0.01}
            value={donationAmount}
            disabled
          />
          <FormText>Amount (in ETH)</FormText>
        </FormRow>
        <FormRow>
          <DonateButton icon="AttachMoney" iconpos="right">
            Donate
          </DonateButton>
        </FormRow>
      </ContentBox>
    </FormWrapper>
  );
};

export default DonationForm;
