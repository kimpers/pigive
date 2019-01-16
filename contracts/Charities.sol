pragma solidity ^0.5.1;


import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract Charities is  Ownable {
    mapping(string => address) private charityAddresses;

    event LogCharityAdded(
        string indexed name,
        address indexed _address
    );

    event LogCharityRemoved(
        string indexed name
    );

    function getCharityByName(
        string memory name
    )
        view
        public
        returns (address)
    {
        address _address =  charityAddresses[name];

        // Don't allow getting entries that don't exist
        require(_address != address(0x0), "does not exist");

        return _address;
    }

    function addCharityEntry(
        string memory name,
        address _address
    )
        onlyOwner
        public
    {
        uint256 nameLength = bytes(name).length;
        // Don't allow empty descriptions
        require(nameLength != 0, "name description");

        // Don't allow 0x address
        require(_address != address(0x0), "can't be 0x0 address");

        // Don't allow changing existing items (remove then add new)
        require(charityAddresses[name] == address(0x0));

        charityAddresses[name] = _address;

        emit LogCharityAdded(
            name,
            _address
        );
    }

    function removeCharityEntry(
        string memory name
    )
        onlyOwner
        public
    {
        delete charityAddresses[name];

        emit LogCharityRemoved(
            name
        );
    }
}
