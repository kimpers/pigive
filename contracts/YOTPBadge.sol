pragma solidity ^0.5.1;


import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract YOTPBadge is ERC721Full, ERC721Mintable, Ownable {
    uint maxSupply;

    constructor(uint _maxSupply)
        ERC721Full("YearOfThePigBadge", "YPB")
        public
    {
        require(_maxSupply > 0, "requires positive max supply");
        maxSupply = _maxSupply;
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
    function mintTo(address _to, string memory _tokenURI)
        public
        onlyOwner
        lessThanMaxSupply
        returns (uint)
    {
        uint256 newTokenId = _getNextTokenId();
        _mint(_to, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        emit LogMinted(newTokenId, _tokenURI);

        return newTokenId;
    }

    /**
    * @dev calculates the next token ID based on totalSupply
    * @return uint256 for the next token ID
    */
    function _getNextTokenId() private view returns (uint256) {
        return totalSupply().add(1);
    }
}
