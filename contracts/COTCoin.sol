pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import "zeppelin-solidity/contracts/token/MintableToken.sol";

contract COTCoin is MintableToken{
	using SafeMath for uint256;

	string public constant name = 'CosplayToken';
	string public constant symbol = 'COT';
	uint8 public constant decimals = 18;

	//セール期間に使えるCOT最大発行量
	uint256 public _maxSaleSupply;

	// overriding MintableToken#mint to　disable mint token function
	// overriding MintableToken#mint トークンミント機能を隠し、ミント機能必要がない、契約オーナーからトークンを上げるから
	function mint(address _to, uint256 _amount, uint256 _JpPremiumSupply) onlyOwner canMint public returns (bool) {

	    totalSupply = totalSupply.add(_amount);

	    balances[_to] = balances[_to].add(_amount);

	    //Mint(_to, _amount);

	    Transfer(address(0), _to, _amount);

	    //40％量COTはセール期間に用
	    _maxSaleSupply = (_amount*40/100).sub(_JpPremiumSupply);

	    return true;
	}

  	/**
	* @dev Function to give token to other user
	* @param _from The address that will give the tokens.
	* @param _to The address that will receive the tokens.
	* @param _value The token amount that token holding owner want to give user
	* @return A uint256 that indicates if the operation was successful.
	*/
	function transferToken(address _from, address _to, uint256 _value) public returns (bool) {

		require(_to != address(0));

		require(_to != _from);

		require(balances[_from] > 0);

		require(_value <= balances[_from]);

		require((_maxSaleSupply.sub(_value)) >= 0);
		// SafeMath.sub will throw if there is not enough balance.

		//minus the holding tokens from owner
		balances[_from] = balances[_from].sub(_value);

		//使えるCOT最大発行量マイナス
		_maxSaleSupply = _maxSaleSupply.sub(_value);

		//plus the holding tokens to buyer
		//トークンを購入したいユーザーはトークンをプラス
		balances[_to] = balances[_to].add(_value);

		Transfer(address(0), _to , _value);
		return true;
	}

  	/**
	* @dev Function to check sale remain token
	* @return A uint256 that indicates if the operation was successful.
	*/
	function remainSaleSupply() public view returns (uint256) {
		return _maxSaleSupply;
	}
}

