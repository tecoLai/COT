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

contract('COTCoinCrowdsale', function ([owner, purchaser, purchaser2, purchaser3]) {
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
    this.preSales_startTime = event_period.preSales_startTime(this.current_time);
    this.preSales_endTime = event_period.preSales_endTime(this.preSales_startTime);
    this.publicSales_startTime = event_period.publicSales_startTime(this.preSales_endTime);
    this.publicSales_endTime = event_period.publicSales_endTime(this.publicSales_startTime);
    this.afterPreSales_endTime = event_period.afterPreSales_endTime(this.preSales_endTime);
    this.afterEndTime = event_period.afterEndTime(this.publicSales_endTime);
    this.crowdsale = await COTCoinCrowdsale.new(this.preSales_startTime, this.preSales_endTime, this.publicSales_startTime, this.publicSales_endTime, rate, lowest_weiAmount, wallet);    
    this.token_address = await this.crowdsale.token();
    //console.log(this.token_address);
    this.token = COTCoin.at(this.token_address);
  });

  it('should be ended only after end', async function () {
    let ended = await this.crowdsale.hasEnded();
    ended.should.equal(false);
    await increaseTimeTo(this.afterEndTime);
    ended = await this.crowdsale.hasEnded();
    ended.should.equal(true);
  });

  describe('accepting payments', function () {
    it('owner can not buy token after pre sale-start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [owner];// add users into whitelist
      await this.crowdsale.importList(whitelist);
      await this.crowdsale.sendTransaction({ value: value, from: owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(owner, { value: value, from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('owner can not buy token after public sale-start', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [owner];// add users into whitelist
      await this.crowdsale.importPublicSaleList(whitelist);
      await this.crowdsale.sendTransaction({ value: value, from: owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(owner, { value: value, from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments before start', async function () {
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { from: purchaser, value: value }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments after pre sale-start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.fulfilled;
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.fulfilled;
    });   

    it('should reject payments after pre sale-end', async function () {
      await increaseTimeTo(this.afterPreSales_endTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    }); 

    it('should reject payments after public sale-end', async function () {
      await increaseTimeTo(this.afterEndTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importPublicSaleList(whitelist);
      await this.crowdsale.sendTransaction({ value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments if eth amount less then lowest_weiAmount after pre sale-start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist);
      await this.crowdsale.sendTransaction({ value: ether(0.2), from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: ether(0.2), from: purchaser }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments if eth amount less then lowest_weiAmount after public sale-start', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importPublicSaleList(whitelist);
      await this.crowdsale.sendTransaction({ value: ether(0.2), from: purchaser }).should.be.fulfilled;
      await this.crowdsale.buyTokens(purchaser, { value: ether(0.2), from: purchaser }).should.be.fulfilled;
    });

    it('should reject payments if　amount of COT less than 1', async function () {
      await increaseTimeTo(this.publicSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importPublicSaleList(whitelist);
      await this.crowdsale.sendTransaction({ value: ether(0.000099), from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(purchaser, { value: ether(0.000099), from: purchaser }).should.be.rejectedWith(EVMRevert);
    });    

  });

});
