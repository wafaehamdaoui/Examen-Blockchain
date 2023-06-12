// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

struct ProjectStr {
    uint256 id;
    address owner;
    string title;
    string description;
    uint256 donationAmount ;
    
    }
 struct Donation {
    uint amount;
    address donor;
}

contract Project {
    uint256 public projectCount=0;
    address public  deployer;
    mapping(uint256 => ProjectStr) public projects;
    mapping(uint256 => Donation[]) public projectDonations;

    function createProject(string memory _title, string memory _description) public {
        if (bytes(_title).length <= 0) {
            revert("Title cannot be empty");
        }
        if (bytes(_description).length <= 0) {
            revert("Description cannot be empty");
        }
        projectCount++;
        projects[projectCount] = ProjectStr(projectCount, msg.sender, _title, _description,0);
        
    }
    function hasDonatedToProject(uint _projectId, address _donor) internal view returns (bool) {
    Donation[] memory donations = projectDonations[_projectId];
    for (uint i = 0; i < donations.length; i++) {
        if (donations[i].donor == _donor) {
            //break ;
            return true;
        }
    }
    return false;
    }

    function donateToProject(uint256 _projectId) public payable {
        if (_projectId <= 0 || _projectId > projectCount) {
            revert("Invalid project ID");
        }
        if (msg.value <= 0) {
            revert("Invalid donation amount");
        }
    
        if (hasDonatedToProject(_projectId, msg.sender)) {
            revert("Already donated to this project");
        }
        projectDonations[_projectId].push(Donation(msg.value, msg.sender));
        address projectOwner = projects[_projectId].owner;
        payable(projectOwner).transfer(msg.value);
    }
    //constructor() {

    //}

}


