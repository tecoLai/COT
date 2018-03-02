/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/unPauseSale.js [--network <name>]
*/
var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
module.exports = function(callback) {
	//console.log('start to restart sale');
	var COTCoinCrowdsaleInstance;
	COTCoinCrowdsale.deployed().then(function(instance){
		COTCoinCrowdsaleInstance = instance;
		return COTCoinCrowdsaleInstance.unpause();
	}).then(function(result){
		//console.log('sale started!');
		console.log(result);

	}).catch(function(err) {
		console.log(err.message);
	});
}
