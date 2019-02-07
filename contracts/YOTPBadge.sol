pragma solidity ^0.5.1;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract YOTPBadge is ERC721Full, Ownable {
    uint maxSupply;
    mapping(uint => string) public badgeLevelURIs;

    constructor(uint _maxSupply)
        ERC721Full("PiGive", "PiGi")
        public
    {
        require(_maxSupply > 0, "requires positive max supply");

        maxSupply = _maxSupply;
    }

    enum BadgeLevel { Bronze, Silver, Gold }

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
        address indexed owner,
        BadgeLevel badgeLevel,
        string tokenURI,
        string message,
        uint createdAt
    );

    /**
    * @dev Mints a a badge to a specified address
    * @param to address for the receiver of badge
    * @param amount uint donation amount
    * @param message string
    */
    function mintTo(
        address to,
        uint amount,
        string memory message
    )
        public
        onlyOwner
        lessThanMaxSupply
        returns (uint)
    {
        uint256 newTokenId = _getNextTokenId();
        BadgeLevel badgeLevel = _getBadgeLevel(amount);
        string memory badgeURI = getBadgeLevelURI(badgeLevel);

        _mint(to, newTokenId);
        _setTokenURI(newTokenId, badgeURI);

        emit LogMinted(newTokenId, to, badgeLevel, badgeURI, message, now);

        return newTokenId;
    }

    /**
     * @dev allows owner to set IPFS hash for images for the different badge levels
     * @param uri string IPFS hash for badge level image
     */
    function setBadgeLevelURI(BadgeLevel badgeLevel, string memory uri)
        onlyOwner
        public
    {
        uint256 uriLength = bytes(uri).length;
        // Don't allow empty uri
        require(uriLength != 0, "uri empty");

        badgeLevelURIs[uint(badgeLevel)] = uri;
    }

    /**
     * @dev get ipfs hash for badge level
     * @param badgeLevel BadgeLevel level for which to get the URI
     * @return ipfs hash for badge image
     */
    function getBadgeLevelURI(BadgeLevel badgeLevel)
        view
        public
        returns (string memory)
    {
        string memory uri = badgeLevelURIs[uint(badgeLevel)];

        return uri;
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
        // 0.888 ether for gold badge level donation
        if (amount >= 888 finney) {
            return BadgeLevel.Gold;
        // 0.088 ether for silver badge level donation
        } else if (amount >= 88 finney) {
            return BadgeLevel.Silver;
        }

        return BadgeLevel.Bronze;
    }


    /**
    * @dev calculates the next token ID based on totalSupply
    * @return uint256 for the next token ID
    */
    function _getNextTokenId() private view returns (uint256) {
        return totalSupply().add(1);
    }
}
