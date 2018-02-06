import ether from './helpers/ether';
import token from './helpers/token';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import EVMRevert from './helpers/EVMRevert';
import { event_period } from './helpers/eventPeriod';
import { event_parameter } from './helpers/eventParameters';
import { event_whitelist } from './helpers/whitelistGenerate.js';

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

  describe('token transaction', function () {
    it('token can be given from owner before sale start', async function () {
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);

    });

    it('token can be given from owner after sale start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);
    });   


    it('token can be given from owner after sale end', async function () {
      await increaseTimeTo(this.afterEndTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      const totalTokenBalance = await this.token.balanceOf(purchaser);
      let totalToken = token(totalTokenBalance.toNumber(10));

      totalToken.should.equal(100);
      
    });


    it('token can be given from user before sale start', async function () {
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.fulfilled;

      const totalTokenBalance1 = await this.token.balanceOf(purchaser);
      let totalToken1 = token(totalTokenBalance1.toNumber(10));


      const totalTokenBalance2 = await this.token.balanceOf(purchaser2);
      let totalToken2 = token(totalTokenBalance2.toNumber(10));


      const totalToken = totalToken1 + totalToken2;

      totalToken.should.equal(100);
    });   

    it('token can be given from user after sale start', async function () {
      await increaseTimeTo(this.preSales_startTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.fulfilled;

      const totalTokenBalance1 = await this.token.balanceOf(purchaser);
      let totalToken1 = token(totalTokenBalance1.toNumber(10));

      const totalTokenBalance2 = await this.token.balanceOf(purchaser2);
      let totalToken2 = token(totalTokenBalance2.toNumber(10));

      const totalToken = totalToken1 + totalToken2;
      totalToken.should.equal(100);
      
    });     

    it('token can be given from user after sale end', async function () {
      await increaseTimeTo(this.afterEndTime);
      const tokens = web3.toWei(100, "ether");
      await this.token.transfer(purchaser, tokens,{from: owner}).should.be.fulfilled;
      await this.token.transfer(purchaser2, tokens,{from: purchaser}).should.be.fulfilled;

      const totalTokenBalance1 = await this.token.balanceOf(purchaser);
      let totalToken1 = token(totalTokenBalance1.toNumber(10));

      const totalTokenBalance2 = await this.token.balanceOf(purchaser2);
      let totalToken2 = token(totalTokenBalance2.toNumber(10));

      const totalToken = totalToken1 + totalToken2;
      totalToken.should.equal(100);
      
    });        

  });
});
