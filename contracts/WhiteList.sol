pragma solidity ^0.4.18;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract WhiteList is Ownable{


	mapping(address => uint8) public whitelist;

  	/**
	* @dev Function to import user's address into whitelist, only user who in the whitelist can purchase token when pre sale.
	*      Whitelistにユーザーアドレスを記録。pre sale期間に、Whitelistに記録したユーザーたちしかトークンを購入できない
	* @param _users The address list that can purchase token when public salse.
	* @return A bool that indicates if the operation was successful.
	*/
	function importList(address[] _users) onlyOwner public returns(bool){

		require(_users.length > 0);

        for(uint i = 0; i < _users.length; i++) {
            whitelist[_users[i]] = 1;
        }		
		return true;
	}

  	/**
	* @dev Function to import user's address into whitelist, only user who in the whitelist can purchase token when public sale.
	*      Whitelistにユーザーアドレスを記録。public sale期間に、Whitelistに記録したユーザーたちしかトークンを購入できない
	* @param _users The address list that can purchase token when public salse.
	* @return A bool that indicates if the operation was successful.
	*/
	function importPublicSaleList(address[] _users) onlyOwner public returns(bool){

		require(_users.length > 0);

        for(uint i = 0; i < _users.length; i++) {
            whitelist[_users[i]] = 2;
        }		
		return true;
	}

  	/**
	* @dev Function check the current user can purchase token or not.
	*      ユーザーアドレスはWhitelistに記録かどうかチェック
	* @param _user The user address that can purchase token or not when public salse.
	* @return A bool that indicates if the operation was successful.
	*/
	function checkList(address _user)public view returns(uint8){
		return whitelist[_user];
	}
}