const Migrations = artifacts.require("../contracts/Migrations.sol");
const HelloWorld = artifacts.require("../contracts/HelloWorld.sol");
const Property = artifacts.require("../contracts/Property.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(HelloWorld);
  deployer.deploy(Property)
};
