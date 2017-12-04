'use strict';

var lisk = require('lisk-js');
var expect = require('chai').expect;

var test = require('../../../functional.js');

var apiHelpers = require('../../../../common/helpers/api');
var phases = require('../../../common/phases');
var Scenarios = require('../../../common/scenarios');
var randomUtil = require('../../../../common/utils/random');
var localCommon = require('./common');

describe('POST /api/transactions (validate type 6 on top of type 4)', function () {

	var scenarios = {
		'regular': new Scenarios.Multisig(),
	};

	var transaction, signature;
	var badTransactions = [];
	var goodTransactions = [];

	localCommon.beforeValidationPhase(scenarios);

	describe('registering dapp', function () {

		it('regular scenario should be ok', function () {
			return localCommon.sendAndSignMultisigTransaction('dapp', scenarios.regular)
				.then(function (transaction) {
					goodTransactions.push(transaction);
				});
		});
	});
	
	describe('confirmation', function () {

		phases.confirmation(goodTransactions, badTransactions);
	});

	describe.skip('sending inTransfer', function () {

		it('regular scenario should be ok', function () {
			return localCommon.sendAndSignMultisigTransaction('inTransfer', scenarios.regular)
				.then(function (transaction) {
					goodTransactions.push(transaction);
				});
		});
	});

	describe('check inTransfer DOES NOt proccess', function () {

		it('regular scenario should fail', function () {
			transaction = lisk.transfer.createOutTransfer(randomUtil.guestbookDapp.id, randomUtil.transaction().id, randomUtil.account().address, 1, scenarios.regular.account.password);
			
			return apiHelpers.sendTransactionPromise(transaction)
				.then(function (res) {
					expect(res).to.have.property('status').to.equal(400);
					expect(res).to.have.nested.property('body.message').to.equal('Invalid transaction body - Frozen transaction type ' + transaction.type);
					badTransactions.push(transaction);
				});
		});
	});

	describe('confirmation', function () {

		phases.confirmation(goodTransactions, badTransactions);
	});
});
