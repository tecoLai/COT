pragma solidity ^0.4.18;

import './COTCoin.sol';
import './WhiteList.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

contract COTCoinCrowdsale is Crowdsale, Pausable, WhiteList{
	using SafeMath for uint256;

	COTCoin public ownerMintableToken;

	//the default total tokens
	//契約オーナー最初持っているトークン量、トークン最大発行量-10億個、default:1000000000
	uint256 public constant _totalSupply = 1000000000*10**18; 

	//契約オーナーアドレス
	address public ownerWallet;

	uint256 public preSale_startTime;
	uint256 public preSale_endTime;
	uint256 public publicSale_startTime;
	uint256 public publicSale_endTime;
	uint256 public lowest_weiAmount;

	function COTCoinCrowdsale(uint256 _startTime, uint256 _preSale_endTime, uint256 _publicSale_startTime, uint256 _endTime, uint256 _rate, uint256 _lowest_weiAmount, address _wallet) public
	    Crowdsale(_startTime, _endTime, _rate, _wallet)
	{
	    //As goal needs to be met for a successful crowdsale
	    //the value needs to less or equal than a cap which is limit for accepted funds
	    ownerWallet = _wallet;
	    preSale_startTime = _startTime;
	    preSale_endTime = _preSale_endTime;
	    publicSale_startTime = _publicSale_startTime;
	    publicSale_endTime = _endTime;
	    lowest_weiAmount = _lowest_weiAmount;
	}

	function createTokenContract() internal returns(MintableToken){
		ownerMintableToken = new COTCoin();

		//send all of token to owner in the begining.
		//最初的に、契約生成するときに全部トークンは契約オーナーに上げる
		ownerMintableToken.mint(msg.sender,_totalSupply);

		return ownerMintableToken;
	}


	// overriding Crowdsale#buyTokens to　send token to buyer, and don't need to mint token
	// overriding Crowdsale#buyTokens,トークン上げる方法改修、新しいトークンミントじゃなくて、契約オーナーからトークンを上げる
	function buyTokens(address beneficiary) public whenNotPaused payable {

		//only pre-salse period and public-sale period that can buy token
		//トークンを購入する期間はpre-saleとpublic-saleだけ
		require( ( (now >= preSale_startTime) && (now <= preSale_endTime) ) || ( (now >= publicSale_startTime) && (now <= publicSale_endTime) ) );

	    require(beneficiary != address(0));

	  	//owner can not buy token
	  	//オーナーはトークンを購入できないというルール設定
	    require(beneficiary != ownerWallet);

	    require(validPurchase());

	    //need to check whitelist when public sale
	    //トークンを購入する場合に、white checkListをチェックしなければならない

	    uint256 weiAmount = msg.value;
	    uint256 tokens = weiAmount.mul(rate);
	    uint8 inWhitelist = checkList(beneficiary);

	    //user should be in white list
	    require( (inWhitelist == 1) || (inWhitelist == 2) );

	    if( (now >= preSale_startTime) && (now <= preSale_endTime) ){

	    	//should be more than 25 eth
	    	require(weiAmount >= lowest_weiAmount);

	    	//user should be 1 in the whitelist when they want purchase token in pre-sale
	    	require( inWhitelist == 1);

	    	tokens = preSaleDiscount( weiAmount, tokens );
	    }

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
			discounted_token = basic_tokens;
		}else if(_weiAmount < 41.668*10**18){
			discounted_token = basic_tokens*100/95; //5% discount
		}else if(_weiAmount < 83.3335*10**18){
			discounted_token = basic_tokens*10/9; //10% discount
		}else if(_weiAmount < 250.0001*10**18){
			discounted_token = basic_tokens*10/8; //20% discount
		}else{
			discounted_token = basic_tokens*10/7; //30% discount
		}

		discounted_token = discounted_token/10**18;
		discounted_token = discounted_token*10**18;

		return discounted_token;
	}	
}
