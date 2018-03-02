/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/getSaleRemainingTokenBalance.js [--network <name>]
*/
var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
var COTCoin = artifacts.require("./COTCoin.sol");
module.exports = function(callback) {
	//console.log('Getting remaining token balances...');
	var COTCoinCrowdsaleInstance;

	COTCoinCrowdsale.deployed().then(function(instance){
		COTCoinCrowdsaleInstance = instance;
        COTCoinCrowdsaleInstance.token().then(function(addr){
          tokenAddress = addr;
          return tokenAddress;

        }).then(function(tokenAddress_data){
            var COTCoinInstance;
            COTCoinInstance = COTCoin.at(tokenAddress_data);
            
            //get sale remain balance
            COTCoinInstance.remainSaleSupply().then(function(balance_data){
              //console.log('Sale remaining token:', (web3.fromWei(balance_data.toString(10), "ether")));
              console.log((web3.fromWei(balance_data.toString(10), "ether")));
            }).catch(function(err) {
              console.log(err.message);
            });

        }).catch(function(err){
          console.log(err.message);
        });

	}).catch(function(err) {
		console.log(err.message);
	});
}
