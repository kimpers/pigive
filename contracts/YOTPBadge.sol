pragma solidity ^0.5.1;


import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract YOTPBadge is ERC721Full, ERC721Mintable, Ownable {
    uint maxSupply;
    mapping(uint => BadgeInfo) public badgeInfos;

    constructor(uint _maxSupply)
        ERC721Full("YearOfThePigBadge", "YPB")
        public
    {
        require(_maxSupply > 0, "requires positive max supply");

        maxSupply = _maxSupply;
    }

    enum BadgeLevel { Bronze, Silver, Gold }

    struct BadgeInfo {
        uint amount;
        string charityId;
        BadgeLevel badgeLevel;
        uint createdAt;
    }

    /**
    * @dev Don't allow for minting more than maxSupply
    */
    modifier lessThanMaxSupply() {
        require(totalSupply() < maxSupply, "max supply reached");
        _;
    }

    /**
    * @dev Log all newly minted badges
    */
    event LogMinted(
        uint indexed id,
        string indexed tokenURI
    );

    /**
    * @dev Mints a a badge to a specified address
    * @param _to address for the receiver of bage
    * @param _tokenURI IPFS hash for badge image
    */
    function mintTo(
        address _to,
        string memory _tokenURI,
        uint _amount,
        string memory _charityId
    )
        public
        onlyOwner
        lessThanMaxSupply
        returns (uint)
    {
        uint256 newTokenId = _getNextTokenId();
        _mint(_to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        _setBadgeInfo(newTokenId, _amount, _charityId);

        emit LogMinted(newTokenId, _tokenURI);

        return newTokenId;
    }

    /**
    * @dev returns the donation badge level for certain donation amount
    * @param amount uint charity donation in wei
    */
    function _getBadgeLevel(uint amount)
        pure
        private
        returns (BadgeLevel)
    {
        // 0.5 eth for gold badge level donation
        if (amount >= 500000000000000000) {
            return BadgeLevel.Gold;
        // 0.1 eth for silver badge level donation
        } else if (amount >= 100000000000000000) {
            return BadgeLevel.Silver;
        }

        return BadgeLevel.Bronze;
    }



    /**
    * @dev sets metadata info for a bage
    * @param tokenId uint id of token created previously
    * @param amount uint amount in wei that was donated to charity
    * @param charityId string id of charity org to which donation was made
    */
    function _setBadgeInfo(
        uint tokenId,
        uint amount,
        string memory charityId
    )
        private
    {
        require(_exists(tokenId));

        BadgeLevel badgeLevel = _getBadgeLevel(amount);

        BadgeInfo memory badgeInfo = BadgeInfo(
            amount,
            charityId,
            badgeLevel,
            now
        );

        badgeInfos[tokenId] = badgeInfo;
    }

    /**
    * @dev calculates the next token ID based on totalSupply
    * @return uint256 for the next token ID
    */
    function _getNextTokenId() private view returns (uint256) {
        return totalSupply().add(1);
    }
}
