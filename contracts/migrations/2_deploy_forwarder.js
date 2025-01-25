// migrations/2_deploy_forwarder.js
const GaslessForwarder = artifacts.require("GaslessForwarder");

module.exports = function (deployer) {
  deployer.deploy(GaslessForwarder);
};