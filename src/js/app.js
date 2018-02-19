App = {
  web3Provider: null,
  contracts: {},
  ownerAccount:"",

  init: function(owner_account) {

    App.ownerAccount = owner_account;
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(App.web3Provider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.when(
        $.getJSON('../build/contracts/COTCoinCrowdsale.json', function(data) {

        // Get the necessary contract artifact file and instantiate it with truffle-contract.
      
        var COTCoinCrowdsaleTokenArtifact = data;
        App.contracts.COTCoinCrowdsale = TruffleContract(COTCoinCrowdsaleTokenArtifact);

        // Set the provider for our contract.
        App.contracts.COTCoinCrowdsale.setProvider(App.web3Provider);
        
      }),
      $.getJSON('../build/contracts/COTCoin.json', function(data) {

        // Get the necessary contract artifact file and instantiate it with truffle-contract.
      
        var COTCoinArtifact = data;
        App.contracts.COTCoin = TruffleContract(COTCoinArtifact);

        // Set the provider for our contract.
        App.contracts.COTCoin.setProvider(App.web3Provider);
      })

    ).then(function(){
        App.getBalances();
      
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('click', '#pause', App.handlePause);
    $(document).on('click', '#unpause', App.handleUnPause);
    $(document).on('click', '#import-whiteList', App.handleImportWhiteList);
    $(document).on('click', '#import-publicSale-whiteList', App.handleImportPublicSaleWhiteList);
    $(document).on('click', '#check-whitelist', App.handleCheckWhiteList);
    $(document).on('click', '#check-history', App.handleCheckHistory);
    $(document).on('click', '#transferTokenButton', App.handleTransferToken);
    $(document).on('click', '#get-lockup-time', App.handleGetLockTime);
    $(document).on('click', '#update-lockup-time', App.handleUpdateLockTime);
  },
  handleUpdateLockTime: function(event) {
    event.preventDefault();
    console.log('updating token locktime');
    var COTCoinCrowdsaleInstance;

    App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
      COTCoinCrowdsaleInstance = instance;

      var new_lockup_time = $('#lock_time_input').val();
      var timestamp = new Date(new_lockup_time).getTime();
      if( isNaN(timestamp)){
        console.log('format error');
        return;
      }
      timestamp = timestamp / 1000;
      console.log(timestamp);
      return COTCoinCrowdsaleInstance.updateLockupTime(timestamp);

    }).then(function(result){
        console.log('update lockup time success');

    }).catch(function(err){
      console.log(err.message);
    });


/*
    App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
      COTCoinCrowdsaleInstance = instance;

      COTCoinCrowdsaleInstance.token().then(function(addr){
        tokenAddress = addr;
        return tokenAddress;

      }).then(function(tokenAddress_data){

        var COTCoinInstance;
        COTCoinInstance = App.contracts.COTCoin.at(tokenAddress_data);
        var new_lockup_time = $('#lock_time_input').val();
        var timestamp = new Date(new_lockup_time).getTime();
        if( isNaN(timestamp)){
          console.log('format error');
          return;
        }
        timestamp = timestamp / 1000;
        console.log(timestamp);
        return COTCoinInstance.updateLockupTime(timestamp);

      }).then(function(result){
        console.log('update lockup time success');

      }).catch(function(err) {
        console.log(err.message);
      });

    }).catch(function(err){
      console.log(err.message);
    });
*/
  },

  handleGetLockTime: function(event) {
    event.preventDefault();
    console.log('get token locktime');
    var COTCoinCrowdsaleInstance;

    App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
      COTCoinCrowdsaleInstance = instance;

      COTCoinCrowdsaleInstance.token().then(function(addr){
        tokenAddress = addr;
        return tokenAddress;

      }).then(function(tokenAddress_data){

        var COTCoinInstance;
        COTCoinInstance = App.contracts.COTCoin.at(tokenAddress_data);

        return COTCoinInstance.getLockupTime();

      }).then(function(lockup_time_result){
        var lockup_timestamp = lockup_time_result.toString(10);

        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var timestamp = new Date(parseInt(lockup_timestamp)*1000);
        var month = months[timestamp.getMonth()];
        var date = timestamp.getDate();
        var hour = timestamp.getHours();
        var min = timestamp.getMinutes();
        var sec = timestamp.getSeconds();
        var time = date + ' ' + month + ' ' +  hour + ':' + min + ':' + sec ;
        console.log(lockup_timestamp);
        console.log(time);

      }).catch(function(err) {
        console.log(err.message);
      });

    }).catch(function(err){
      console.log(err.message);
    });

  },

  handlePause: function(event) {
    event.preventDefault();
    console.log('pausing sale');
    var COTCoinCrowdsaleInstance;

    App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
      COTCoinCrowdsaleInstance = instance;
      return COTCoinCrowdsaleInstance.pause();

    }).then(function(result){
      console.log('sale pause!');
      console.log(result);
    }).catch(function(err){
      console.log(err.message);
    });
  },

  handleUnPause: function(event) {
    event.preventDefault();
    console.log('starting sale');
    var COTCoinCrowdsaleInstance;

    App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
      COTCoinCrowdsaleInstance = instance;
      return COTCoinCrowdsaleInstance.unpause();

    }).then(function(result){
      console.log('sale start!');
      console.log(result);
    }).catch(function(err){
      console.log(err.message);
    });
  },

  handleTransferToken: function(event) {
    event.preventDefault();

    var amount = $('#WantToSendTokenAmount').val();
    var toAddress = $('#WantToSendAddress').val();

    console.log('Give ' + amount + ' Token to '+ toAddress);

    var COTCoinCrowdsaleInstance;

    App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
      COTCoinCrowdsaleInstance = instance;

      COTCoinCrowdsaleInstance.token().then(function(addr){
        tokenAddress = addr;
        return tokenAddress;

      }).then(function(tokenAddress_data){

        var COTCoinInstance;
        COTCoinInstance = App.contracts.COTCoin.at(tokenAddress_data);
        var weiAmount = web3.toWei(amount, "ether");

        return COTCoinInstance.transfer(toAddress, weiAmount);

      }).then(function(result){
        alert('Send Successful!');
        $('#WantToSendTokenAmount').val('');
        return App.getBalances();

      }).catch(function(err) {
        console.log(err.message);
      });

    }).catch(function(err){
      console.log(err.message);
    });
  },

  handleTransfer: function(event) {
    event.preventDefault();

    var amount = $('#TTTransferAmount').val();

    console.log('Pay ' + amount + ' ether ');

    var COTCoinCrowdsaleInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
        COTCoinCrowdsaleInstance = instance;
        console.log( web3.toWei(amount, "ether"));
        return COTCoinCrowdsaleInstance.sendTransaction({ from: account, value: web3.toWei(amount, "ether")})

      }).then(function(result) {
        alert('Pay Successful!');
        $('#TTTransferAmount').val('');
        return App.getBalances();

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  
  handleImportWhiteList: function(event){
    event.preventDefault();
    console.log(' import pre sale whitelist');

    var WhiteListInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

/*
      test user
      var users = ["0xf17f52151ebef6c7334fad080c5704d77216b732",
      "0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef",
      "0x6330a553fc93768f612722bb8c2ec78ac90b3bbc",
      "0x5aeda56215b167893e80b4fe645ba6d5bab767de"];
*/

      var new_list = [];
      var whitelistFile = $.trim($('#whitelistToUpload').val());

      if(whitelistFile == ''){
        alert('no content');
      }else{

        var whitelistFile_json = jQuery.parseJSON(whitelistFile);
        
        for(var json_index = 0; json_index < whitelistFile_json.length; json_index++){
          new_list.push(whitelistFile_json[json_index]);
        }
        
        var whitelist_list = [];
        for(var index = 0; index < new_list.length; index+=100){
          whitelist_list.push(new_list.slice(index,index+100));
        }

        console.log(whitelist_list);

        App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
          WhiteListInstance = instance;

          for(var list_index = 0; list_index < whitelist_list.length; list_index ++ ){
            var importing_data = whitelist_list[list_index];
            WhiteListInstance.importList(whitelist_list[list_index]).then(function(result){
              console.log(result);
            }).catch(function(err) {
              console.log(err.message);
            });
          }  

        }).catch(function(err) {
          console.log(err.message);
        });
      }

    });    
  },  

  handleImportPublicSaleWhiteList: function(event){
    event.preventDefault();
    console.log(' import public sale whitelist');

    var WhiteListInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

/*
      test user
      var users = ["0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
      "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2"];
*/

      var new_list = [];
      var publicSalewhitelistFile = $.trim($('#publicSalewhitelistToUpload').val());
      if(publicSalewhitelistFile == ''){
        alert('no content');
      }else{
        var publicSalewhitelistFile_whitelistFile_json = jQuery.parseJSON(publicSalewhitelistFile);
        
        for(var json_index = 0; json_index < publicSalewhitelistFile_whitelistFile_json.length; json_index++){
          new_list.push(publicSalewhitelistFile_whitelistFile_json[json_index]);
        }
        
        var publicSale_whitelist_list = [];
        for(var index = 0; index < new_list.length; index+=100){
          publicSale_whitelist_list.push(new_list.slice(index,index+100));
        }

        console.log(publicSale_whitelist_list);

        App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
          WhiteListInstance = instance;

          for(var list_index = 0; list_index < publicSale_whitelist_list.length; list_index ++ ){
            var importing_data = publicSale_whitelist_list[list_index];
            WhiteListInstance.importPublicSaleList(publicSale_whitelist_list[list_index]);
          }  

        }).catch(function(err) {
          console.log(err.message);
        });
      }  

    });    
  },  


  handleCheckWhiteList: function(event){
    event.preventDefault();
    console.log(' address check');

    var WhiteListInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      
      var address = $('#address_input').val();
      console.log(address);
      App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
        WhiteListInstance = instance;
        return WhiteListInstance.checkList(address);
      }).then(function(result) {
         console.log(result.toString(10));

      }).catch(function(err) {
        console.log(err.message);
      });
    });    
  },  

  handleCheckHistory: function(event){
    event.preventDefault();
    
    var token_address = document.getElementById('tokenAddress').innerHTML;
    console.log('contract address history　', token_address);
    var HistoryInstance;
      contractAddress = token_address;
      web3.eth.filter({
        address: contractAddress,
        fromBlock: 1,
        toBlock: 'latest'
      }).get(function (err, result) {
        
/*
        web3.eth.getTransactionCount("0x9ad8eecf9a3d5949af816c0b2d4f34c635bf093f", function(error, result){
          console.log('eth transaction count ');
          console.log(result);
        })

        web3.eth.getTransactionCount(token_address, function(error, result){
          console.log('give token count ');
          console.log(result);
        })
*/
        for(var index = 0; index < result.length; index ++){

          //console.log(result[index]);
          //console.log(result[index].blockHash);
          //console.log(result[index].transactionHash);

          $.when(
            //transaction time get
            web3.eth.getBlock(result[index].blockHash, function(error, result){
                if(!error){
                  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  var timestamp = new Date(parseInt(result.timestamp)*1000);
                  var month = months[timestamp.getMonth()];
                  var date = timestamp.getDate();
                  var hour = timestamp.getHours();
                  var min = timestamp.getMinutes();
                  var sec = timestamp.getSeconds();
                  var time = date + ' ' + month + ' ' +  hour + ':' + min + ':' + sec ;
                  //console.log(result);
                  console.log(time);
                }
                else{
                    console.error(error);
                }    
            })
            ).then(function(){

              //buyer address, eth get  
              web3.eth.getTransaction(result[index].transactionHash, function(error, result){
                if(!error){
                  var from = result.from;
                  var to = result.to;
                  var value = result.value;
                  value = value.toString(10);
                  var ether_amount =  web3.fromWei(value, "ether");
                  var receipt = 'from ' + from + ' to ' + to + '/ send ' + ether_amount;
                  console.log(receipt);
                }
                else{
                    console.error(error);
                }
              })

            })
        }
      })
  },  

  getBalances: function(adopters, account){
    console.log('Getting address...');

    var COTCoinCrowdsaleInstance;
    var tokenAddress;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log('Getting accounts...');
      console.log(accounts);
      App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
        COTCoinCrowdsaleInstance = instance;

        COTCoinCrowdsaleInstance.token().then(function(addr){
          tokenAddress = addr;
          $("#tokenAddress").text(tokenAddress);
          console.log('token address: '+tokenAddress);
          return tokenAddress;

        }).then(function(tokenAddress_data){
            console.log('Getting balances...');
            var COTCoinInstance;
            COTCoinInstance = App.contracts.COTCoin.at(tokenAddress_data);

            //get user balance
            COTCoinInstance.balanceOf(account).then(function(balance_data){
              balance = COTCoinInstance.totalSupply();
              console.log(balance);
              console.log('balance_data:');
              console.log(balance_data);
              return balance_data.toString(10);

            }).then(function(result){
              console.log('balance: '+result);
              balance =  web3.fromWei(result, "ether")
              $('#TTBalance').text(balance);
            }).catch(function(err) {
              console.log(err.message);
            });

            //get owner remain balance
            COTCoinInstance.balanceOf(App.ownerAccount).then(function(balance_data){
              balance = COTCoinInstance.totalSupply();
              console.log(balance);
              console.log('balance_data:');
              console.log(balance_data);
              return balance_data.toString(10);

            }).then(function(result){
              console.log('balance: '+result);
              balance =  web3.fromWei(result, "ether")
              $('#remainBalance').text(balance);
            }).catch(function(err) {
              console.log(err.message);
            });

            //get sale remain balance
            COTCoinInstance.remainSaleSupply().then(function(balance_data){
              $('#saleRemainBalance').text(web3.fromWei(balance_data.toString(10), "ether"));
            }).catch(function(err) {
              console.log(err.message);
            });

        }).catch(function(err){
          console.log(err.message);
        });
      }).catch(function(err) {
        console.log(err.message);
      });
    });    

    return tokenAddress;
  }
 
};

$(function() {
  $(window).load(function() {
    var ownerAccount = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
    App.init(ownerAccount);
  });
});
