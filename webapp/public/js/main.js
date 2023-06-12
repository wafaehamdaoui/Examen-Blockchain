import { ABI, ContractAddress } from "./config.js";

let web3js;
let account;
let contract;
let projectCount;
let projects = [];
//let donations = [];
let accountElement = document.getElementById("accountElement");
let createBtn = document.getElementById("createBtn");
let main = async () => {
    if (!window.ethereum)
      return alert('please download metamask')
    window.ethereum.on('accountsChanged', (accounts) => {
      account = accounts[0]
      accountElement.innerText = account
      loadTickets();
    })
    web3js = new Web3(window.ethereum)
    //1- recuperation du compte addresse depuis metamask
    account = (await web3js.eth.requestAccounts())[0]
    console.log(account);
    accountElement.innerText = account
  
    // ----- creation de l objet contract
  
    contract = new web3js.eth.Contract(ABI, ContractAddress);
    console.log(contract)

  createBtn.addEventListener('click', () => {
    modal.show();
  });

  loadProjects();
};

main();

const loadProjects = async () => {
    projectCount = await contract.methods.projectCount().call();
    console.log("Number of projects:", projectCount);

    projects = [];

    for (let i = 1; i <= projectCount; i++) {
      let project = await contract.methods.projects(i).call();
      projects.push(project);
    }

    console.log("Projects:", projects);
    projectsContainer.innerHTML = "";

    projects.forEach((project) => {
        displayProject(project);
  });
}



const displayProject = (project) => {
    let projectCard = document.createElement('div');
    projectCard.classList.add('card', 'shadow-sm');
  
    let projectTitle = document.createElement('h2');
    projectTitle.classList.add('projectTitle');
    projectTitle.innerText = project.title;
  
    let cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
  
    let projectDescription = document.createElement('p');
    projectDescription.classList.add('card-text', 'textProject');
    projectDescription.innerText = project.description;
  
    let buttonGroup = document.createElement('div');
    buttonGroup.classList.add('btn-group');
  
    let donateButton = document.createElement('button');
    donateButton.classList.add('btn', 'btn-success');
    donateButton.type = 'button';
    donateButton.innerText = 'Donate';
    donateButton.addEventListener('click', () => {
      donateToProject(project.id);
    });
  
    let donorsButton = document.createElement('button');
    donorsButton.classList.add('btn', 'btn-primary');
    donorsButton.type = 'button';
    donorsButton.innerText = 'List of donors';
    donorsButton.addEventListener('click', () => {
      getDonors(project.id);
    });
  
    let donationAmount = document.createElement('small');
    donationAmount.classList.add('text-body-secondary');
    donationAmount.innerText = `${project.donationAmount} ETH`;
  
    buttonGroup.appendChild(donateButton);
    buttonGroup.appendChild(donorsButton);
  
    cardBody.appendChild(projectDescription);
    cardBody.appendChild(buttonGroup);
    cardBody.appendChild(donationAmount);
  
    projectCard.appendChild(projectTitle);
    projectCard.appendChild(cardBody);
  
    let column = document.createElement('div');
    column.classList.add('col');
    column.appendChild(projectCard);
  
    const projectsContainer = document.getElementById('projectsContainer');
    projectsContainer.appendChild(column);
  };
  async function createProject(title, description) {
    displayLoading();
  try {
    const result = await contract.methods.createProject(title, description).send({
      from: account,
      gas: 200000,
      gasPrice: await web3js.eth.getGasPrice()
    });
    console.log('Project created:', result);
  } catch (error) {
    console.error(error);
  }
  hideLoading();
 }
 const createForm = document.getElementById('createModal');
  createForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('titleInput').value;
    const description = document.getElementById('descriptionInput').value;
    await createProject(title, description);
    modal.hide(); 
  });
  
async function donateToProject(projectId) {
    displayLoading();
  let donationAmount = prompt("Enter the amount in ETH to donate to this project:");
  if (donationAmount) {
    try {
      await contract.methods.donateToProject(projectId).send({ 
        from: account,
        value: web3js.utils.toWei(donationAmount.toString(), 'ether'),
        gas: 200000,
        gasPrice: await web3js.eth.getGasPrice()
     });
      alert("Donation successful!");
      loadProjects();
    } catch (error) {
      console.error("Error donating to project:", error);
    }
  }
  hideLoading();
}

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

  const displayLoading = () => {
    const loadingContainer = document.getElementById('loadingContainer');
    loadingContainer.style.display = 'block';
  };
  
  const hideLoading = () => {
    const loadingContainer = document.getElementById('loadingContainer');
    loadingContainer.style.display = 'none';
  };

