const property = artifacts.require("./Property.sol");
const propertyRegistry = artifacts.require("./PropertyRegistry.sol");
const propertyToken = artifacts.require("./PropertyToken.sol");

module.exports = function(deployer) {
    deployer.deploy(property, "Property", "PROP").then(
        () => deployer.deploy(propertyToken, "PropertyToken", "PT", 18).then(
            () => deployer.deploy(propertyRegistry, property.address, propertyToken.address)
        )
    )
};