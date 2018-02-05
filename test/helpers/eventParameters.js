
export const event_parameter = {
  rate: function () { return new web3.BigNumber(10000); },
  goalToken: function (val) { return 20; },
  goal: function (val) { return val*10**18; },
  totalSupply: function () { return 1000000000; },
  cap: function (val) { return val*10**18; },
  randomNum: function () { return (Math.random() * 10 + 1).toFixed(2); },
};


