import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import EVMRevert from './helpers/EVMRevert';
import { event_period } from './helpers/eventPeriod';
import { event_parameter } from './helpers/eventParameters';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
const COTCoin = artifacts.require("./COTCoin.sol");


contract('COTCoinCrowdsale', function ([owner, purchaser, purchaser2, purchaser3, purchaser4, purchaser5]) {
  const wallet = owner;
  const rate = event_parameter.rate();
  const totalSupply = event_parameter.totalSupply();
  const randomNum = event_parameter.randomNum();
  const value = ether(randomNum);
  const lowest_weiAmount = event_parameter.lowest_weiAmount();

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {

    this.current_time = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    this.premiumSales_startTime = event_period.premiumSales_startTime(this.current_time);;
    this.premiumSales_endTime = event_period.premiumSales_endTime(this.premiumSales_startTime);;
    this.preSales_startTime = event_period.preSales_startTime(this.premiumSales_endTime);
    this.preSales_endTime = event_period.preSales_endTime(this.preSales_startTime);
    this.publicSales_startTime = event_period.publicSales_startTime(this.preSales_endTime);
    this.publicSales_endTime = event_period.publicSales_endTime(this.publicSales_startTime);
    this.afterPreSales_endTime = event_period.afterPreSales_endTime(this.preSales_endTime);
    this.afterEndTime = event_period.afterEndTime(this.publicSales_endTime);
    this.lockUpTime = event_period.lockUpTime(this.publicSales_endTime); 
    this.crowdsale = await COTCoinCrowdsale.new(this.premiumSales_startTime, this.premiumSales_endTime, this.preSales_startTime, this.preSales_endTime, this.publicSales_startTime, this.publicSales_endTime, this.lockUpTime, rate, lowest_weiAmount, wallet);   
    this.token_address = await this.crowdsale.token();
    //console.log(this.token_address);
    this.token = COTCoin.at(this.token_address);
  });

  it('can not be paused twice', async function () {
    await this.crowdsale.pause().should.be.fulfilled;
    await this.crowdsale.pause().should.be.rejectedWith(EVMRevert);
  });

  it('can not be unpaused twice', async function () {
    await this.crowdsale.pause().should.be.fulfilled;
    await this.crowdsale.unpause().should.be.fulfilled;
    await this.crowdsale.unpause().should.be.rejectedWith(EVMRevert);
  });

  it('can not be unpaused before pause', async function () {
    await this.crowdsale.unpause().should.be.rejectedWith(EVMRevert);
  });

  describe('pause sale for premium sale', function () {
    
    it('should accept if sale does not be paused', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [purchaser4];// add users into whitelist
      await this.crowdsale.importList(whitelist, 3);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser4 }).should.be.fulfilled;
    });

    it('should reject if sale was be paused', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [purchaser5];// add users into whitelist
      await this.crowdsale.importList(whitelist, 3);
      await this.crowdsale.pause();
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser5 }).should.be.rejectedWith(EVMRevert);

    });

    it('should accept if sale was be unpaused', async function () {
      await increaseTimeTo(this.premiumSales_startTime);
      const whitelist = [purchaser5];// add users into whitelist
      await this.crowdsale.importList(whitelist, 3);
      await this.crowdsale.pause();
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser5 }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.unpause();
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser5 }).should.be.fulfilled;      
    });    

  });

  describe('pause sale for pre sale', function () {
    
    it('should accept if sale does not be paused', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist, 1);
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser }).should.be.fulfilled;
    });

    it('should reject if sale was be paused', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist, 1);
      await this.crowdsale.pause();
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser }).should.be.rejectedWith(EVMRevert);

    });

    it('should accept if sale was be unpaused', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist, 1);
      await this.crowdsale.pause();
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.unpause();
      await this.crowdsale.sendTransaction({ value: ether(25), from: purchaser }).should.be.fulfilled;      
    });    

  });


  describe('pause sale for public sale', function () {
    
    it('should accept if sale does not be paused', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist, 2);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.fulfilled;
      await this.crowdsale.buyTokens(purchaser, { from: purchaser, value: value }).should.be.fulfilled;
    });

    it('should reject if sale was be paused', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist, 2);
      await this.crowdsale.pause();
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);

    });

    it('should accept if sale was be unpaused', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist, 2);
      await this.crowdsale.pause();
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.unpause();
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.fulfilled;
      await this.crowdsale.buyTokens(purchaser, { from: purchaser, value: value }).should.be.fulfilled;      
    });    
    
  });
});
