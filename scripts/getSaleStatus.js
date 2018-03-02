/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/getSaleStatus.js [--network <name>]
*/
var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
module.exports = function(callback) {
	//console.log('getting sale pause status');
	var COTCoinCrowdsaleInstance;
	COTCoinCrowdsale.deployed().then(function(instance){
		COTCoinCrowdsaleInstance = instance;
		return COTCoinCrowdsaleInstance.ispause();
	}).then(function(result){
		console.log(result);

	}).catch(function(err) {
		console.log(err.message);
	});
}
