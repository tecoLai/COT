import ether from './helpers/ether';
import token from './helpers/token';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import { event_period } from './helpers/eventPeriod';
import { event_parameter } from './helpers/eventParameters';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
const COTCoin = artifacts.require("./COTCoin.sol");

contract('COTCoinCrowdsale', function ([owner, purchaser, purchaser2, purchaser3]) {
  const wallet = owner;
  const rate = event_parameter.rate();
  const goalToken = event_parameter.goalToken();
  const goal = event_parameter.goal(goalToken);
  const totalSupply = event_parameter.totalSupply();
  const cap = event_parameter.cap(totalSupply);
  const randomNum = event_parameter.randomNum();
  const value = ether(randomNum);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });


  var preSales_startTime = event_period.preSales_startTime();
  var preSales_endTime = event_period.preSales_endTime();
  var publicSales_startTime = event_period.publicSales_startTime();
  var publicSales_endTime = event_period.publicSales_endTime();
  var afterPreSales_endTime = event_period.afterPreSales_endTime(preSales_endTime);
  var afterEndTime = event_period.afterEndTime(publicSales_endTime);

  console.log([preSales_startTime, preSales_endTime, publicSales_startTime, publicSales_endTime, afterPreSales_endTime, afterEndTime]);
});
