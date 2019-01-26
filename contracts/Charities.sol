pragma solidity ^0.5.1;


import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract Charities is  Ownable {
    // TODO: refactor this to a dynamic array of struct { name, address }
    mapping(string => address payable) private charityAddresses;

    /**
     * @dev Log all new charities added
     */
    event LogCharityAdded(
        string name,
        address _address
    );

    /**
     * @dev Log all Charities removed
     */
    event LogCharityRemoved(
        string name
    );

    /**
     * @dev Get address of charity from name
     * @param name string name identifying charity
     */
    function getCharityAddressByName(
        string memory name
    )
        view
        public
        returns (address payable)
    {
        address payable _address =  charityAddresses[name];

        // Don't allow getting entries that don't exist
        require(_address != address(0x0), "does not exist");

        return _address;
    }

    /**
     * @dev allows owner to add new charities to the list
     * @param name string name identifying the charity
     * @param _address address donation eth address for charity
     */
    function addCharityEntry(
        string memory name,
        address payable _address
    )
        onlyOwner
        public
    {
        uint256 nameLength = bytes(name).length;
        // Don't allow empty descriptions
        require(nameLength != 0, "name description");

        // Don't allow 0x address
        require(_address != address(0x0), "can't be 0x0 address");

        // Don't allow overwriting existing items (remove then add new)
        require(charityAddresses[name] == address(0x0), "charity already exists");

        charityAddresses[name] = _address;

        emit LogCharityAdded(
            name,
            _address
        );
    }

    /**
     * @dev allows owner to remove a charity from the list
     * @param name string name identifying the charity
     */
    function removeCharityEntry(
        string memory name
    )
        onlyOwner
        public
    {
        // Only allow deleting existing entries
        require(charityAddresses[name] != address(0x0), "charity does not exist");

        delete charityAddresses[name];

        emit LogCharityRemoved(
            name
        );
    }
}
