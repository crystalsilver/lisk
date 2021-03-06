'use strict';

var test = require('../../functional.js');

var lisk = require('lisk-js');
var expect = require('chai').expect;

var phases = require('../../common/phases');
var localCommon = require('./common');

var sendTransactionPromise = require('../../../common/helpers/api').sendTransactionPromise;

var randomUtil = require('../../../common/utils/random');
var normalizer = require('../../../common/utils/normalizer');

describe('POST /api/transactions (unconfirmed type 7 on top of type 1)', function () {

	var transaction;
	var badTransactions = [];
	var goodTransactions = [];

	var account = randomUtil.account();

	localCommon.beforeUnconfirmedPhaseWithDapp(account);

	describe('outTransfer', function () {

		it('using second signature with an account that has a pending second passphrase registration should fail', function () {
			transaction = lisk.transfer.createOutTransfer(randomUtil.guestbookDapp.transactionId, randomUtil.transaction().id, randomUtil.account().address, 10 * normalizer, account.password, account.secondPassword);

			return sendTransactionPromise(transaction).then(function (res) {
				expect(res).to.have.property('status').to.equal(400);
				expect(res).to.have.nested.property('body.message').to.equal('Sender does not have a second signature');
				badTransactions.push(transaction);
			});
		});

		it('using no second signature with an account that has a pending second passphrase registration should be ok', function () {
			transaction = lisk.transfer.createOutTransfer(randomUtil.guestbookDapp.transactionId, randomUtil.transaction().id, randomUtil.account().address, 10 * normalizer, account.password);

			return sendTransactionPromise(transaction).then(function (res) {
				expect(res).to.have.property('status').to.equal(200);
				expect(res).to.have.nested.property('body.status').to.equal('Transaction(s) accepted');

				// TODO: Enable when transaction pool order is fixed
				// goodTransactions.push(transaction);
			});
		});
	});

	describe('confirmation', function () {

		phases.confirmation(goodTransactions, badTransactions);
	});
});
