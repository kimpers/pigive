pragma solidity ^0.5.1;

import './YOTPBadge.sol';
import './Charities.sol';

contract DonationManager {
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
        string indexed charityName,
        address charityAddress,
        uint indexed tokenId,
        address indexed from
    );

    /**
     * @dev allows anyone to download to a charity and receive/give away a collectible ERC721 token
     * @param charityName string the identifier of charity for which to donate the ether sent
     * @param receiver address the address for whom to send the ERC721 token for the donation
     */
    function donate(string memory charityName, address receiver)
        payable
        public
    {
        require(msg.value >= 8 finney, "0.008 ether min donation");
        require(receiver != address(0x0), "invalid receiver");

        address payable charityAddress = trustedCharities.getCharityAddressByName(charityName);
        require(charityAddress != address(0x0), "invalid charity");

        uint tokenId = trustedYTOPBage.mintTo(
            receiver,
            msg.value,
            charityName
        );

        emit LogDonation(
            charityName,
            charityAddress,
            tokenId,
            msg.sender
        );

        charityAddress.transfer(msg.value);
    }
}
