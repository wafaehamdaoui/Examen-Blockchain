const project =artifacts.require('Project')

module.exports =  (deployer,network,accounts)=>{
    console.log("network : "+network);
    console.log("accounts");
    console.table(accounts);
    deployer.deploy(project);

   
}