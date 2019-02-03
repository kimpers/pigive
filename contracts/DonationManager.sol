pragma solidity ^0.5.1;

import 'openzeppelin-solidity/contracts/lifecycle/Pausable.sol';

import './YOTPBadge.sol';
import './Charities.sol';

contract DonationManager is Pausable {
    YOTPBadge private trustedYTOPBage;
    Charities private trustedCharities;

    constructor(address _YOTPBadge, address _charities)
        public
    {
        trustedYTOPBage = YOTPBadge(_YOTPBadge);
        trustedCharities = Charities(_charities);
    }

    /**
     * @dev Event for every successful donation
     * @param charityName string identifier for charity organization
     * @param charityAddress address address to charity
     * @param tokenId uint id of ERC721 token created for donation
     * @param from address the address of donator
     */
    event LogDonation(
        uint indexed tokenId,
        address indexed charityAddress,
        address indexed from,
        string charityName,
        uint amount,
        uint createdAt
    );

    /**
     * @dev allows anyone to download to a charity and receive/give away a collectible ERC721 token
     * @param charityName string the identifier of charity for which to donate the ether sent
     * @param receiver address the address for whom to send the ERC721 token for the donation
     * @param message string free text message from the donater
     */
    function donate(string memory charityName, address receiver, string memory message)
        payable
        whenNotPaused
        public
    {
        require(msg.value >= 8 finney, "0.008 ether min donation");
        require(receiver != address(0x0), "invalid receiver");

        address payable charityAddress = trustedCharities.getCharityAddressByName(charityName);
        require(charityAddress != address(0x0), "invalid charity");

        uint tokenId = trustedYTOPBage.mintTo(
            receiver,
            msg.value,
            message
        );

        emit LogDonation(
            tokenId,
            charityAddress,
            msg.sender,
            charityName,
            msg.value,
            now
        );

        charityAddress.transfer(msg.value);
    }
}
