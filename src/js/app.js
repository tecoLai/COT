App = {
  web3Provider: null,
  contracts: {},
  
  init: function() {
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
    //var toAddress = $('#TTTransferAddress').val();

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
  
  handleBalance: function(event){
    event.preventDefault();
    console.log(' balance check');

    var COTCoinCrowdsaleInstance;
    var BalanceInstance;


    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log('account address ',account);
      App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
        COTCoinCrowdsaleInstance = instance;

        COTCoinCrowdsaleInstance.token().then(function(addr){
          tokenAddress = addr;
          return tokenAddress;

        }).then(function(tokenAddress_data){

          var BalanceInstance;
          BalanceInstance = App.contracts.COTCoin.at(tokenAddress_data);
          return BalanceInstance.balanceOf(account);

        }).then(function(result) {
          console.log( web3.fromWei(result, "ether"));

        }).catch(function(err) {
          console.log(err.message);
        });

      }).catch(function(err){
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

      var users = ["0xf17f52151ebef6c7334fad080c5704d77216b732","0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef"];
      console.log('import address info');
      console.log(users);
      App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
        WhiteListInstance = instance;
        console.log(users);
        return WhiteListInstance.importList(users);

      }).then(function(result) {
        console.log('import success');
        console.log(users);

      }).catch(function(err) {
        console.log(err.message);
      });
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

      var users = ["0x821aEa9a577a9b44299B9c15c88cf3087F3b5544","0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2"];
      console.log('import address info');
      console.log(users);
      App.contracts.COTCoinCrowdsale.deployed().then(function(instance) {
        WhiteListInstance = instance;
        console.log(users);
        return WhiteListInstance.importPublicSaleList(users);

      }).then(function(result) {
        console.log('import success');
        console.log(users);

      }).catch(function(err) {
        console.log(err.message);
      });
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
    console.log(' address history　', token_address);
    var HistoryInstance;
      contractAddress = token_address;
      web3.eth.filter({
        address: contractAddress,
        fromBlock: 1,
        toBlock: 'latest'
      }).get(function (err, result) {

        for(var index = 0; index < result.length; index ++){

          //console.log(result[index]);
          //console.log(result[index].blockHash);
          //console.log(result[index].transactionHash);


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

          //buyer address, eth get  
          web3.eth.getTransaction(result[index].transactionHash, function(error, result){
            if(!error){
              var from = result.from;
              var to = result.to;
              var value = result.value;
              value = value.toString(10);
              var a =  web3.fromWei(value, "ether");
              var receipt = 'from' + from + ' to ' + to + '/ send ' + a;
              console.log(receipt);
            }
            else{
                console.error(error);
            }
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
    App.init();
  });
});
