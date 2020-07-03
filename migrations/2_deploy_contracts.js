const BUSD = artifacts.require('BUSDImplementation');
const Proxy = artifacts.require('AdminUpgradeabilityProxy');

module.exports = async function(deployer) {
  await deployer;

  await deployer.deploy(BUSD);
  const proxy = await deployer.deploy(Proxy, BUSD.address);
  const proxiedBUSD = await BUSD.at(proxy.address);
  await proxy.changeAdmin("0x0e9d874fb23614f3f0c16fcc5802cb5e967b58f3");
  await proxiedBUSD.initialize();
  await proxiedBUSD.initializeDomainSeparator();
};
