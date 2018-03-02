/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/updateLockUpTime.js [--network <name>] [--date=<2018/02/01>] [--time=<19:00:00>]
*/

//process.argv
var args = require('minimist')(process.argv.slice(2));

var date = '';
var time = '';

if(args['date'] == null){
	console.log('format error');
	process.exit(1);
}

date = args['date'];

if(args['time'] != null){
	time = args['time'];
}

var new_locktime = date + ' ' + time;
var timestamp = new Date(new_locktime).getTime();
if( isNaN(timestamp)){
	console.log('format error');
	process.exit(1);
}

timestamp = timestamp / 1000;

var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
var COTCoin = artifacts.require("./COTCoin.sol");
module.exports = function(callback) {
	//console.log('start to update locktime');
	var COTCoinCrowdsaleInstance;
	COTCoinCrowdsale.deployed().then(function(instance){
		COTCoinCrowdsaleInstance = instance;
		return COTCoinCrowdsaleInstance.updateLockupTime(timestamp);
	}).then(function(result){
		//console.log('update end');
		console.log(result);

	}).catch(function(err) {
		console.log(err.message);
	});
}



