import React, { Fragment, useState } from "react";
import styled from "styled-components";
import { isNil, uniqBy } from "ramda";
import idx from "idx";
import { DrizzleContext } from "drizzle-react";
import { toast } from "react-toastify";
import {
  Heading,
  Text,
  Input,
  Button,
  Select,
  Flex,
  Box,
  Loader,
  Textarea
} from "rimble-ui";

const FormSelect = styled(Select)`
  color: #333;
  width: 100%;

  :disabled {
    opacity: 0.7;
  }
`;

const FormWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding 15px;
`;

const FormHeading = styled(Heading.h2)`
  text-align: center;
  padding-top: 10px;
  color: #333;
`;

const FormText = styled(Text.span)`
  color: #333;
  font-weight: bold;
  align-self: center;
  margin-bottom: 3px;
`;

const FormInput = styled(Input)`
  color: #333;

  :disabled {
    opacity: 0.7;
  }
`;

const FormButton = styled(Button)`
  background-color: #aa381e
  color: #ffd700;
  width: 100%;
  margin-top: 10px;
  z-index: 1;

  & > svg:last-child {
    margin-left: 0px;
  }

  :hover {
    background-color: #ffd700;
    color: #aa381e
  }
`;

const ContentBox = styled.div`
  display: inline-block;
  align-self: center;
`;

const donationLevelMapping = {
  Gold: 0.888,
  Silver: 0.088,
  Bronze: 0.008
};

const filterActiveCharities = allEvents => {
  const charitiyAddedEvents = allEvents.filter(
    e => e.event === "LogCharityAdded"
  );
  const removedCharities = new Set(
    allEvents.filter(e => e.event === "LogCharityRemoved")
  );

  return uniqBy(
    c => c.name,
    charitiyAddedEvents
      .filter(e => !removedCharities.has(e.event))
      .map(c => c.returnValues)
  );
};

const FormStep1 = ({
  activeCharities,
  charityName,
  setCharityName,
  donationLevel,
  setDonationLevel,
  donationAmount,
  setDonationAmount,
  setFormStep
}) => (
  <Fragment>
    <Flex flexDirection="column">
      <FormText>Charity to donate to</FormText>
      <FormSelect
        items={activeCharities.map(e => e.name)}
        value={charityName}
        onChange={e => setCharityName(e.target.value)}
      />
    </Flex>
    <Flex flexDirection="column">
      <FormText>Select donation level</FormText>
      <FormSelect
        items={["Bronze", "Silver", "Gold"]}
        value={donationLevel}
        onChange={e => {
          const level = e.target.value;
          const amount = donationLevelMapping[level];

          setDonationLevel(level);
          setDonationAmount(amount);
        }}
      />
    </Flex>
    <Flex flexDirection="column">
      <FormText>Amount (in ETH)</FormText>
      <FormInput type="number" value={donationAmount} disabled />
    </Flex>
    <FormButton onClick={() => setFormStep(2)}>Continue</FormButton>
  </Fragment>
);

const FormStep2 = ({
  isPending,
  receiverAccount,
  setReceiverAccount,
  message,
  setMessage,
  setFormStep,
  donate
}) => (
  <Fragment>
    <Flex flexDirection="column">
      <FormText>Token receiver address</FormText>
      <FormInput
        disabled={isPending}
        size="48"
        value={receiverAccount}
        onChange={e => setReceiverAccount(e.target.value)}
      />
    </Flex>
    <Flex flexDirection="column">
      <FormText>Message</FormText>
      <Textarea
        rows={4}
        value={message}
        onChange={e => setMessage(e.target.value)}
        disabled={isPending}
        style={{ resize: "none" }}
      />
    </Flex>
    <Flex>
      <Box width={1 / 3} mr="5px">
        <FormButton
          disabled={isPending}
          icon="ArrowBack"
          onClick={() => setFormStep(1)}
        >
          Back
        </FormButton>
      </Box>
      <Box width={2 / 3}>
        <FormButton
          disabled={isPending}
          icon={isPending ? null : "AttachMoney"}
          iconpos="right"
          onClick={donate}
        >
          {isPending ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                lineHeight: "40px"
              }}
            >
              <span style={{ marginRight: "10px" }}>Loading...</span>
              <Loader size="40px" />
            </div>
          ) : (
            <span>Claim Token</span>
          )}
        </FormButton>
      </Box>
    </Flex>
  </Fragment>
);

const DonationForm = ({
  donationContract,
  donationLevel,
  setDonationLevel,
  message,
  setMessage,
  currentAccount,
  toWei,
  drizzleState
}) => {
  const [charityName, setCharityName] = useState();
  const [donationAmount, setDonationAmount] = useState(0.008);
  const [receiverAccount, setReceiverAccount] = useState(currentAccount);
  const [donationKey, setDonationKey] = useState();
  const [donationStatus, setDonationStatus] = useState();
  const [formStep, setFormStep] = useState(1);

  const clearForm = () => {
    setCharityName(activeCharities[0].name);
    setDonationAmount(0.008);
    setReceiverAccount(currentAccount);
    setDonationLevel("Bronze");
    setMessage();
    setFormStep(1);
  };

  const donate = () => {
    const donationKey = donationContract.methods.donate.cacheSend(
      charityName,
      receiverAccount,
      message || "",
      { value: toWei(donationAmount) }
    );

    setDonationKey(donationKey);
  };

  const activeCharities = filterActiveCharities(
    drizzleState.contracts.Charities.events
  );
  if (activeCharities.length && !charityName) {
    setCharityName(activeCharities[0].name);
  }

  if (!isNil(donationKey)) {
    const donationTx = drizzleState.transactionStack[donationKey];
    const status = idx(drizzleState, _ => _.transactions[donationTx].status);

    if (donationStatus === "pending" && status === "success") {
      toast.success(`Donation successful!`);
      clearForm();
    } else if (donationStatus === "pending" && status === "error") {
      toast.error("Something went wrong.");
      clearForm();
    }

    if (donationStatus !== status) {
      setDonationStatus(status);
    }
  }

  const isPending = donationStatus === "pending";

  return (
    <FormWrapper>
      <ContentBox>
        <FormHeading>PiGive - Give & Get</FormHeading>
        {formStep === 1 ? (
          <FormStep1
            activeCharities={activeCharities}
            charityName={charityName}
            setCharityName={setCharityName}
            donationLevel={donationLevel}
            setDonationLevel={setDonationLevel}
            donationAmount={donationAmount}
            setDonationAmount={setDonationAmount}
            setFormStep={setFormStep}
          />
        ) : (
          <FormStep2
            isPending={isPending}
            receiverAccount={receiverAccount}
            setReceiverAccount={setReceiverAccount}
            message={message}
            setMessage={setMessage}
            setFormStep={setFormStep}
            donate={donate}
          />
        )}
      </ContentBox>
    </FormWrapper>
  );
};

export default props => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzle, drizzleState } = drizzleContext;
      const currentAccount = drizzleState.accounts[0];
      const toWei = amount =>
        drizzle.web3.utils.toWei(amount.toString(), "ether");

      return (
        <DonationForm
          donationContract={drizzle.contracts.DonationManager}
          drizzleState={drizzleState}
          currentAccount={currentAccount}
          toWei={toWei}
          {...props}
        />
      );
    }}
  </DrizzleContext.Consumer>
);
