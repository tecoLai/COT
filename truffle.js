
require('babel-register');
require('babel-polyfill');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    live:{
      host: "localhost",
      port: 8545,
      network_id: 1
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    privateGethNet: {
      host: "localhost",
      port: 8545,
      network_id: "15",
      from: "0x627306090abab3a6e1400e9345bc60c78a8bef57"
    } 
  }
};
