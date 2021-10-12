const {expect} = require('chai');

const {Broadcast} = require('./broadcast.js');

describe('bmoor.eventing.manager', function () {
	const sut = require('./manager.js');

	let manager = null;
	let broadcast = null;

	beforeEach(function () {
		broadcast = new Broadcast();

		manager = new sut.Manager(broadcast);
	});

	it('should work as a mixin', function () {
		expect(manager.trigger).to.not.equal(undefined);
	});

	describe('::trigger', function () {
		it('should properly trigger', function (done) {
			const res = [];

			broadcast.on('test', function (datum) {
				res.push(datum);
			});

			manager.trigger('test', 1, [{foo: 'bar'}]);
			manager.trigger('test', 2, [{hello: 'world'}]);
			manager.trigger('test', 1, [{foo: 'bar2'}]);

			setTimeout(function () {
				expect(res).to.deep.equal([{foo: 'bar2'}, {hello: 'world'}]);

				done();
			}, 10);
		});
	});
});
