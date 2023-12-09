const Migrations = artifacts.require("EgMarket");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};