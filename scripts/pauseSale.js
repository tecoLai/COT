/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/pauseSale.js [--network <name>]
*/
var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
module.exports = function(callback) {
	//console.log('start to paues sale');
	var COTCoinCrowdsaleInstance;
	COTCoinCrowdsale.deployed().then(function(instance){
		COTCoinCrowdsaleInstance = instance;
		return COTCoinCrowdsaleInstance.pause();
	}).then(function(result){
		//console.log('sale paused!');
		console.log(result);

	}).catch(function(err) {
		console.log(err.message);
	});
}



