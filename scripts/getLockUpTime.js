/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/getLockUpTime.js [--network <name>]
*/

var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
var COTCoin = artifacts.require("./COTCoin.sol");
module.exports = function(callback) {
  
	var COTCoinCrowdsaleInstance;
	COTCoinCrowdsale.deployed().then(function(instance){
		COTCoinCrowdsaleInstance = instance;
 		COTCoinCrowdsaleInstance.token().then(function(addr){
	        tokenAddress = addr;
	        return tokenAddress;

		}).then(function(tokenAddress_data){
			//console.log(tokenAddress_data);
			var COTCoinInstance;
			COTCoinInstance = COTCoin.at(tokenAddress_data);
			return COTCoinInstance.getLockupTime();

		}).then(function(lock_time){
			//console.log(lock_time);
	        var lockup_timestamp = lock_time.toString(10);
	        var timestamp = new Date(parseInt(lockup_timestamp)*1000);
	        var year = timestamp.getFullYear();
	        var month = timestamp.getMonth() + 1;
	        var date = timestamp.getDate();
	        var hour = timestamp.getHours();
	        var min = timestamp.getMinutes();
	        var sec = timestamp.getSeconds();
	        var time = year + '/' + month + '/' +  date + ' ' + hour + ':' + min + ':' + sec ;
	        console.log(time);
		}).catch(function(err) {
			console.log(err.message);
		});

	}).catch(function(err) {
		console.log(err.message);
	});
}