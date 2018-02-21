pragma solidity ^0.4.18;

import './COTCoin.sol';
import './WhiteList.sol';
import './CrowdsaleWithLockUp.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

contract COTCoinCrowdsale is CrowdsaleWithLockUp, Pausable, WhiteList{
	using SafeMath for uint256;

	COTCoin public ownerMintableToken;

	//the default total tokens
	//契約オーナー最初持っているトークン量、トークン最大発行量-10億個、default:1000000000
	uint256 public constant _totalSupply = 1000000000*10**18; 

	//契約オーナーアドレス
	address public ownerWallet;

	uint256 public premiumSale_startTime;
	uint256 public premiumSale_endTime;
	uint256 public preSale_startTime;
	uint256 public preSale_endTime;
	uint256 public publicSale_startTime;
	uint256 public publicSale_endTime;
	uint256 public lowest_weiAmount;

	function COTCoinCrowdsale(uint256 _premiumSale_startTime, uint256 _premiumSale_endTime, uint256 _preSale_startTime, uint256 _preSale_endTime, uint256 _publicSale_startTime, uint256 _publicSale_endTime, uint256 _token_lockUp_releaseTime, uint256 _rate, uint256 _lowest_weiAmount, address _wallet) public
	    CrowdsaleWithLockUp(_premiumSale_startTime, _publicSale_endTime, _rate, _wallet, _token_lockUp_releaseTime)
	{
	    //As goal needs to be met for a successful crowdsale
	    //the value needs to less or equal than a cap which is limit for accepted funds
	    ownerWallet = _wallet;
	    premiumSale_startTime = _premiumSale_startTime;
	    premiumSale_endTime = _premiumSale_endTime;
	    preSale_startTime = _preSale_startTime;
	    preSale_endTime = _preSale_endTime;
	    publicSale_startTime = _publicSale_startTime;
	    publicSale_endTime = _publicSale_endTime;
	    lowest_weiAmount = _lowest_weiAmount;

	}

	function createTokenContract() internal returns(MintableToken){
		ownerMintableToken = new COTCoin(lockUpTime);

		//send all of token to owner in the begining.
		//最初的に、契約生成するときに全部トークンは契約オーナーに上げる
		ownerMintableToken.mint(msg.sender, _totalSupply);

		return ownerMintableToken;
	}


	// overriding Crowdsale#buyTokens to　send token to buyer, and don't need to mint token
	// overriding Crowdsale#buyTokens,トークン上げる方法改修、新しいトークンミントじゃなくて、契約オーナーからトークンを上げる
	function buyTokens(address beneficiary) public whenNotPaused payable {

		//only pre-salse period and public-sale period that can buy token
		//トークンを購入する期間はpre-saleとpublic-saleだけ
		require( ( (now >= premiumSale_startTime) && (now <= premiumSale_endTime) ) || ( (now >= preSale_startTime) && (now <= preSale_endTime) ) || ( (now >= publicSale_startTime) && (now <= publicSale_endTime) ) );

	    require(beneficiary != address(0));

	  	//owner can not buy token
	  	//オーナーはトークンを購入できないというルール設定
	    require(beneficiary != ownerWallet);

	    require(validPurchase());

	    uint256 weiAmount = msg.value;

	    //最低限0.0001個ETHを送金しなければなりません。
	    require( weiAmount >= 0.0001*10**18 );

	    uint256 tokens = weiAmount.mul(rate);
	    uint8 inWhitelist = checkList(beneficiary);

	    //user should be in white list
	    //トークンを購入する場合に、white checkListをチェックしなければならない
	    //1:プレセール, 2:パブリックセール, 3:プレミアムセール
	    require( (inWhitelist == 1) || (inWhitelist == 2) || (inWhitelist == 3));

	    //プレミアム期間
	    if( (now >= premiumSale_startTime) && (now <= premiumSale_endTime) ){

	    	//user should be 3 in the whitelist when they want purchase token in premium-sale
			require( inWhitelist == 3 );

			//should be more than 25 eth
	    	require(weiAmount >= lowest_weiAmount);
	    	tokens = premiumSaleDiscount( weiAmount, tokens );
		}

		//プレセール期間
		if( (now >= preSale_startTime) && (now <= preSale_endTime) ){

			//user should be 1 in the whitelist when they want purchase token in pre-sale
	    	//or user should be 3 in the whitelist when they want purchase token in premium-sale
			require( (inWhitelist == 1) || (inWhitelist == 3) );

	    	//should be more than 25 eth
	    	require(weiAmount >= lowest_weiAmount);		
	    	tokens = preSaleDiscount( weiAmount, tokens );	
		}

	    //最低限1個COTを購入しなければなりません。
	    require( tokens >= 1*10**18 );

	    //小数点切り捨てる
	    tokens = tokens/10**18;
		tokens = tokens*10**18;

	    // update state
	    weiRaised = weiRaised.add(weiAmount);

	    require(ownerMintableToken.transferToken(ownerWallet, beneficiary, tokens));

	    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

	    forwardFunds();
	}


  	/**
	* @dev Function to give discount when presale
	* @param _weiAmount The wei amount that buyer send
	* @return A uint256 that indicates if the operation was successful.
	*/
	function preSaleDiscount(uint256 _weiAmount, uint256 basic_tokens)public pure returns (uint256){
		uint256 discounted_token;

		if(_weiAmount < 25*10**18){
			discounted_token = 0;
		}else if(_weiAmount < 41.6668*10**18){
			discounted_token = basic_tokens*100/95; //5% discount
		}else if(_weiAmount < 83.3335*10**18){
			discounted_token = basic_tokens*10/9; //10% discount
		}else if(_weiAmount < 250.0001*10**18){
			discounted_token = basic_tokens*10/8; //20% discount
		}else{
			discounted_token = basic_tokens*10/7; //30% discount
		}

		return discounted_token;
	}	

  	/**
	* @dev Function to give discount when premium sale
	* @param _weiAmount The wei amount that buyer send
	* @return A uint256 that indicates if the operation was successful.
	*/
	function premiumSaleDiscount(uint256 _weiAmount, uint256 basic_tokens)public pure returns (uint256){
		uint256 discounted_token;

		if(_weiAmount < 25*10**18){
			discounted_token = 0;
		}else if(_weiAmount < 41.6668*10**18){
			discounted_token = basic_tokens*100/95; //5% discount
		}else if(_weiAmount < 83.3335*10**18){
			discounted_token = basic_tokens*10/9; //10% discount
		}else if(_weiAmount < 250.0001*10**18){
			discounted_token = basic_tokens*10/8; //20% discount
		}else{
			discounted_token = basic_tokens*10/6; //40% discount
		}

		return discounted_token;
	}	
	

  	/**
	* @dev Function to update token lockup time
	* @return A bool that indicates if the operation was successful.
	*/
	function updateLockupTime(uint256 _newLockUpTime) onlyOwner public returns(bool){
		require( _newLockUpTime > now );
		return ownerMintableToken.updateLockupTime(_newLockUpTime);
	}	
}
