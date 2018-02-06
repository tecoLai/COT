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
  console.log('randomNum',randomNum);
  const value = ether(randomNum);
  const lowest_weiAmount = event_parameter.lowest_weiAmount();

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {

    this.current_time = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    this.preSales_startTime = event_period.preSales_startTime(this.current_time);
    this.preSales_endTime = event_period.preSales_endTime(this.preSales_startTime);
    this.publicSales_startTime = event_period.publicSales_startTime(this.preSales_endTime);
    this.publicSales_endTime = event_period.publicSales_endTime(this.publicSales_startTime);
    this.afterPreSales_endTime = event_period.afterPreSales_endTime(this.preSales_endTime);
    this.afterEndTime = event_period.afterEndTime(this.publicSales_endTime);
    this.crowdsale = await COTCoinCrowdsale.new(this.preSales_startTime, this.preSales_endTime, this.publicSales_startTime, this.publicSales_endTime, rate, goal, cap, lowest_weiAmount, wallet);   
    this.token_address = await this.crowdsale.token();
    //console.log(this.token_address);
    this.token = COTCoin.at(this.token_address);
  });


  it('should be token owner', async function () {
    const owner = await this.token.owner();
    owner.should.equal(this.crowdsale.address);
  });

  it('owner should have total token', async function () {
    const owner_totalSupply = await this.token.totalSupply();
    const owner_totalSupply_amount = token(owner_totalSupply);

    //console.log(owner_totalSupply_amount);
    //console.log(typeof(owner_totalSupply_amount));

    owner_totalSupply_amount.should.equal(totalSupply);
  });


  describe('purchase balance check', function () {
    it('should be 0 before purchase', async function () {
      const totalToken_data1 = await this.token.balanceOf(purchaser);
      const totalToken1 = totalToken_data1.toNumber(10);
      totalToken1.should.equal(0);
    });   

    it('should not be 0 after purchase when public sale', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.crowdsale.importList(whitelist);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.fulfilled;

      const totalToken_data2 = await this.token.balanceOf(purchaser);
      const totalToken2 = token(totalToken_data2.toNumber(10));
      const expectToken2 = token((rate*value));

      /*
      console.log(value);      
      console.log(totalToken2);
      console.log(expectToken2);
      console.log(typeof(totalToken2));
      console.log(typeof(expectToken2));      
      */

      totalToken2.should.equal(expectToken2);
    });

    it('total amount of token should not change when public sale', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.crowdsale.importList(whitelist);

      const value1 = ether((Math.random() * 10 + 1).toFixed(2));
      await this.crowdsale.sendTransaction({ value: value1, from: purchaser }).should.be.fulfilled;
      const totalToken_data3 = await this.token.balanceOf(purchaser);
      const totalToken3 = token(totalToken_data3.toNumber(10));
      
      const value2 = ether((Math.random() * 10 + 1).toFixed(2))
      await this.crowdsale.sendTransaction({ value: value2, from: purchaser2 }).should.be.fulfilled;
      const totalToken_data4 = await this.token.balanceOf(purchaser2);
      const totalToken4 = token(totalToken_data4.toNumber(10));

      const owner_holding_totalToken_data = await this.token.balanceOf(owner);
      const owner_holding_totalToken = token(owner_holding_totalToken_data.toNumber(10));

      const total_amount = totalToken3 + totalToken4 + owner_holding_totalToken;

      /*
      console.log(value1);   
      console.log(value2);      
      console.log(owner_holding_totalToken);
      console.log(totalToken3);
      console.log(totalToken4);
      console.log(typeof(owner_holding_totalToken));
      console.log(typeof(totalToken3)); 
      console.log(typeof(totalToken4));      
      */

      total_amount.should.equal(totalSupply);
    });

  });
});
