// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthRecord {
    struct Record {
        string cid;
        string recordType;
        uint timestamp;
    }

    mapping(address => Record[]) private userRecords;

    event RecordAdded(address user, string cid, string recordType);

    function addRecord(string memory _cid, string memory _recordType) public {
        userRecords[msg.sender].push(Record(_cid, _recordType, block.timestamp));
        emit RecordAdded(msg.sender, _cid, _recordType);
    }

    function getRecords(address _user) public view returns (Record[] memory) {
        return userRecords[_user];
    }
}
