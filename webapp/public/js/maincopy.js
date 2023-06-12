import { ABI, ContractAddress } from "./config.js";

let web3js;
let account;
let contract;
let projectCount;
let projects = [];
//let donations = [];

let main = async () => {
  if (!window.ethereum)
    return alert('Please download MetaMask');

  window.ethereum.on('accountsChanged', (accounts) => {
    account = accounts[0];
    accountElement.innerText = account;
    loadProjects();
  });

  web3js = new Web3(window.ethereum);

  // Get the connected MetaMask account
  account = (await web3js.eth.requestAccounts())[0];
  console.log(account);
  accountElement.innerText = account;

  // Create the contract instance
  contract = new web3js.eth.Contract(ABI, ContractAddress);
  console.log(contract);

  // Load the projects
  loadProjects();
};

main();

// Load projects from the smart contract
async function loadProjects() {
  try {
    projectCount = await contract.methods.projectCount().call();
    console.log("Number of projects:", projectCount);

    // Reset the projects array
    projects = [];

    for (let i = 1; i <= projectCount; i++) {
      let project = await contract.methods.projects(i).call();
      projects.push(project);
    }

    console.log("Projects:", projects);
    // Update the UI with the loaded projects
    displayProjects();

  } catch (error) {
    console.error("Error loading projects:", error);
  }
}

// Display the loaded projects in the HTML template
function displayProjects() {
  projectsContainer.innerHTML = "";

  projects.forEach((project) => {
    let projectCard = `
      <div class="col">
        <div class="card shadow-sm">
          <h2 class="projectTitle">${project.title}</h2>
          <div class="card-body">
            <p class="card-text textProject">${project.description}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                <button class="btn btn-success" type="button" onclick="donateToProject(${project.id})">
                  Donate
                </button>
                <button class="btn btn-primary" type="button" onclick="getDonors(${project.id})">
                  List of donors
                </button>
              </div>
              <small class="text-body-secondary">${project.donationAmount} ETH</small>
            </div>
          </div>
        </div>
      </div>
    `;

    projectsContainer.innerHTML += projectCard;
  });
}

// Function to handle donating to a project
async function donateToProject(projectId) {
  let donationAmount = prompt("Enter the amount in ETH to donate to this project:");
  if (donationAmount) {
    try {
      await contract.methods.donateToProject(projectId).send({ value: web3js.utils.toWei(donationAmount.toString(), 'ether') });
      alert("Donation successful!");
      loadProjects();
    } catch (error) {
      console.error("Error donating to project:", error);
    }
  }
}

// Function to get the list of donors for a project
async function getDonors(projectId) {
  try {
    let donors = await contract.methods.projectDonations(projectId).call();
    let donorsList = "";

    for (let i = 0; i < donors.length; i++) {
      donorsList += `${i + 1}- ${donors[i].donor} : ${donors[i].amount} ETH\n`;
    }

    alert(`List of donors:\n${donorsList}`);

  } catch (error) {
    console.error("Error getting donors:", error);
  }
}
