pragma solidity ^0.4.18;

import './COTCoin.sol';
import './WhiteList.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/RefundableCrowdsale.sol';

contract COTCoinCrowdsale is CappedCrowdsale, RefundableCrowdsale, WhiteList{
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


	function COTCoinCrowdsale(uint256 _startTime, uint256 _preSale_endTime, uint256 _publicSale_startTime, uint256 _endTime, uint256 _rate, uint256 _goal, uint256 _cap, address _wallet) public
	    CappedCrowdsale(_cap)
	    FinalizableCrowdsale()
	    RefundableCrowdsale(_goal)
	    Crowdsale(_startTime, _endTime, _rate, _wallet)
	{
	    //As goal needs to be met for a successful crowdsale
	    //the value needs to less or equal than a cap which is limit for accepted funds
	    require(_goal <= _cap);
	    ownerWallet = _wallet;
	    preSale_startTime = _startTime;
	    preSale_endTime = _preSale_endTime;
	    publicSale_startTime = _publicSale_startTime;
	    publicSale_endTime = _endTime;

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
	function buyTokens(address beneficiary) public payable {

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

	    require(inWhitelist == 1);

	    // calculate token amount to be created
	    if((now >= preSale_startTime) && (now <= preSale_endTime)){
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
		uint8 dcimal = 3;

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

		discounted_token = round(discounted_token, dcimal);

		return discounted_token;
	}	

  	/**
	* @dev Function to round number
	* @param _number The token amount
	* @param _dcimal how many dcimal want to show
	* @return A uint256 that indicates if the operation was successful.
	*/
	function round(uint256 _number, uint8 _dcimal)public pure returns (uint256){
		uint256 _uint = 18 - _dcimal;
		uint256 _tmp_number_value = _number/10**(_uint-1);
		uint256 _number_value = _number/10**_uint;

		uint256 quotient  = _tmp_number_value / 10;
        uint256 remainder = _tmp_number_value - 10 * quotient;

        if(remainder > 4){
        	_number_value = _number_value + 1;
        }

		_number_value = _number_value*10**_uint;
		return _number_value;
	}
}
