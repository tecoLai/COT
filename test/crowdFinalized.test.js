import ether from './helpers/ether';
import token from './helpers/token';
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
  const goalToken = event_parameter.goalToken();
  const goal = event_parameter.goal(goalToken);
  const totalSupply = event_parameter.totalSupply();
  const cap = event_parameter.cap(totalSupply);
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
    this.crowdsale = await COTCoinCrowdsale.new(this.preSales_startTime, this.preSales_endTime, this.publicSales_startTime, this.publicSales_endTime, rate, goal, cap, lowest_weiAmount, wallet);   
    this.token_address = await this.crowdsale.token();
    //console.log(this.token_address);
    this.token = COTCoin.at(this.token_address);
  });


  describe('finalized test', function () {
    it('cannot be finalized twice', async function () {
      await increaseTimeTo(this.afterEndTime);
      await this.crowdsale.finalize({ from: owner, gasPrice: 0  });
      await this.crowdsale.finalize({ from: owner, gasPrice: 0  }).should.be.rejectedWith(EVMRevert);
    });
  
    it('cannot be finalized before ending', async function () {
      await this.crowdsale.finalize({ from: owner, gasPrice: 0 }).should.be.rejectedWith(EVMRevert);
    });

    it('cannot be finalized by third party after ending', async function () {
      await increaseTimeTo(this.afterEndTime);
      await this.crowdsale.finalize({ from: purchaser, gasPrice: 0 }).should.be.rejectedWith(EVMRevert);
    });

    it('can be finalized by owner after ending', async function () {
      await increaseTimeTo(this.afterEndTime);
      await this.crowdsale.finalize({ from: owner, gasPrice: 0 }).should.be.fulfilled;
    });

  });

  describe('crowdsale goal reach', function () {
    it('owner should receive ether', async function () {
      const purchaser_ether = 10;
      const purchaser2_ether = 15;
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.crowdsale.importList(whitelist);
      await this.crowdsale.sendTransaction({ value: ether(purchaser_ether), from: purchaser }).should.be.fulfilled;
      await this.crowdsale.sendTransaction({ value: ether(purchaser2_ether), from: purchaser2 }).should.be.fulfilled;

      await increaseTimeTo(this.afterEndTime);
      const pre = web3.eth.getBalance(owner);
      await this.crowdsale.finalize({ from: owner, gasPrice: 0 }).should.be.fulfilled;
      const post = web3.eth.getBalance(owner);
      const expect_total_ether = purchaser_ether + purchaser2_ether;
      post.minus(pre).should.be.bignumber.equal(ether(expect_total_ether));

    });
  });

  describe('crowdsale goal not reach', function () {
    it('should allow refunds after end if goal was not reached', async function () {
      const purchaser_ether = 10;
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser];// add users into whitelist
      await this.crowdsale.importList(whitelist);
      await this.crowdsale.sendTransaction({ value: ether(purchaser_ether), from: purchaser }).should.be.fulfilled;
      await increaseTimeTo(this.afterEndTime);

      await this.crowdsale.finalize({ from: owner, gasPrice: 0 }).should.be.fulfilled;

      const pre = web3.eth.getBalance(owner);
      const purchaser_pre = web3.eth.getBalance(purchaser);
      await this.crowdsale.claimRefund({ from: purchaser, gasPrice: 0 }).should.be.fulfilled;
      const post = web3.eth.getBalance(owner);
      const purchaser_post = web3.eth.getBalance(purchaser);
      /*
      console.log([pre, post]);
      console.log([purchaser_pre,purchaser_post]);
      */
      post.minus(pre).should.be.bignumber.equal(0);
      purchaser_post.minus(purchaser_pre).should.be.bignumber.equal(ether(purchaser_ether));
    });
   
  });

  describe('refund check', function () {
    it('should deny refunds before end', async function () {
      await this.crowdsale.claimRefund({ from: purchaser }).should.be.rejectedWith(EVMRevert);
      await increaseTimeTo(this.preSales_startTime);
      await this.crowdsale.claimRefund({ from: purchaser }).should.be.rejectedWith(EVMRevert);
    });

    it('should deny refunds after end if goal was reached', async function () {
      const purchaser_ether = 10;
      const purchaser2_ether = 15;
      await increaseTimeTo(this.preSales_startTime);
      const whitelist = [purchaser,purchaser2];// add users into whitelist
      await this.crowdsale.importList(whitelist);
      await this.crowdsale.sendTransaction({ value: ether(purchaser_ether), from: purchaser }).should.be.fulfilled;
      await this.crowdsale.sendTransaction({ value: ether(purchaser2_ether), from: purchaser2 }).should.be.fulfilled;
      await increaseTimeTo(this.afterEndTime);
      await this.crowdsale.finalize({ from: owner, gasPrice: 0 }).should.be.fulfilled;
      await this.crowdsale.claimRefund({ from: purchaser }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.claimRefund({ from: purchaser2 }).should.be.rejectedWith(EVMRevert);
    });
  });
});
