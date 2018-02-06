
require('babel-register');
require('babel-polyfill');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    live:{ // this will deploy to the live network
      host: "localhost",
      port: 8545,
      network_id: 1
    },
    development: { // this will deploy to the dev testrpc or ganache-cli network
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    privateGethNet: { // this will deploy to the dev geth network
      host: "localhost",
      port: 8545,
      network_id: "15",
      from: "0x627306090abab3a6e1400e9345bc60c78a8bef57" //please change this to your address
    } 
  }
};
