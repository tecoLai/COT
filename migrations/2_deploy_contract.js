var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");

module.exports = function(deployer, network, accounts){


	var current_time = (new Date()).getTime();
	current_time = parseInt(current_time/1000);

	var preSalse_startTime = (new Date('2018/02/15 00:00:00')).getTime(); //2/15
	preSalse_startTime = parseInt(preSalse_startTime/1000);
	preSalse_startTime = preSalse_startTime + 12*60*60; //12時

	var preSalse_endTime = (new Date('2018/02/28 00:00:00')).getTime();
	preSalse_endTime = parseInt(preSalse_endTime/1000); 
	preSalse_endTime = preSalse_endTime + 23*60*60; //23時
	preSalse_endTime = preSalse_endTime + 50*60; // 50分 end

	var publicSalse_startTime = (new Date('2018/03/01 00:00:00')).getTime();
	publicSalse_startTime = parseInt(publicSalse_startTime/1000);　
	publicSalse_startTime = publicSalse_startTime + 12*60*60; 　//12時

	var publicSalse_endTime = (new Date('2018/04/15 00:00:00')).getTime();
	publicSalse_endTime = parseInt(publicSalse_endTime/1000);
	publicSalse_endTime = publicSalse_endTime + 23*60*60; //23時
	publicSalse_endTime = publicSalse_endTime + 50*60; // 50分 end

	//取引レート
	//1 ETH = 10000 COT
	const rate = new web3.BigNumber(10000);　
	const wallet = accounts[0]; //デプロイ用なアドレス設定

	const lowest_weiAmount = 25*10**18;

	deployer.deploy(COTCoinCrowdsale, preSalse_startTime, preSalse_endTime, publicSalse_startTime, publicSalse_endTime, rate, lowest_weiAmount, wallet);
};
