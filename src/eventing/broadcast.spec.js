const {expect} = require('chai');

describe('bmoor.eventing.broadcast', function () {
	var obj, triggered;

	const {Broadcast} = require('./broadcast.js');

	beforeEach(function () {
		obj = new Broadcast();
		triggered = false;

		obj.on('boom', function (args) {
			triggered = args;
		});
	});

	it('should work as a mixin', function () {
		expect(obj.on).to.exist;
	});

	describe('::trigger', function () {
		it('should properly trigger', function (done) {
			obj.trigger('boom', 'doop');

			setTimeout(function () {
				expect(triggered).to.equal('doop');
				done();
			}, 0);
		});

		it('should return back a promise that returns when all complete', function (done) {
			obj.on('test', function () {
				return new Promise((resolve) => {
					setTimeout(resolve, 10);
				});
			});

			obj.on('test', function () {
				return new Promise((resolve) => {
					setTimeout(resolve, 30);
				});
			});

			let returned = false;

			obj.trigger('test').then(function () {
				returned = true;
			});

			setTimeout(function () {
				expect(returned).to.equal(false);
			}, 20);

			setTimeout(function () {
				expect(returned).to.equal(true);

				done();
			}, 40);
		});

		it('should work with an array for orders of called', function () {
			let called = 0;
			let firstCall = null;
			let secondCall = null;

			obj.on('test', [
				function (var1) {
					firstCall = var1;
				},
				function (var2) {
					secondCall = var2;
				}
			]);

			obj.on('test', function () {
				called++;
			});

			obj.trigger('test', 'var-1');
			obj.trigger('test', 'var-2');
			obj.trigger('test', 'var-3');

			expect(firstCall).to.equal('var-1');
			expect(secondCall).to.equal('var-2');
			expect(called).to.equal(3);
		});
	});

	it('should pass in arguments', function (done) {
		var t = {};

		obj.trigger('boom', t);

		setTimeout(function () {
			expect(triggered).to.equal(t);
			done();
		}, 0);
	});

	it('should pass in arguments', function (done) {
		obj.trigger('foo', null);

		setTimeout(function () {
			expect(triggered).to.equal(false);
			done();
		});
	});

	it('should pass multiple arguments', function (done) {
		var eins, zwei;

		obj.on('foo', function (arg1, arg2) {
			eins = arg1;
			zwei = arg2;
		});

		obj.on('foo', function () {
			expect(eins).to.equal('hello');
			expect(zwei).to.equal('world');

			done();
		});

		obj.trigger('foo', 'hello', 'world');
	});

	it('should handle recursive events', function (done) {
		var step1 = false,
			step2 = false,
			stable = false;

		obj.on('step-1', function () {
			step1 = true;

			expect(step2).to.equal(false);
			expect(stable).to.equal(false);

			obj.trigger('step-2');
		});

		obj.on('step-2', function () {
			step2 = true;

			expect(stable).to.equal(false);
		});

		obj.on('step-2', function () {
			stable = true;
			expect(step1).to.equal(true);
			expect(step2).to.equal(true);

			done();
		});

		obj.trigger('step-1');
	});

	it('should clear event when a once is applied', async function () {
		var value;

		let called1 = false;
		let called2 = false;
		let called3 = false;

		obj.once('test-1', function (v) {
			value = v;

			called1 = true;
		});

		obj.on('test-1', async function (v) {
			if (v !== 2) {
				await obj.trigger('test-1', v + 1);
			} else {
				await obj.trigger('test-2', v + 1);
			}

			called2 = true;
		});

		obj.on('test-2', function (v) {
			expect(value).to.equal(0);
			expect(v).to.equal(3);

			called3 = true;
		});

		await obj.trigger('test-1', 0);

		expect(called1).to.equal(true);

		expect(called2).to.equal(true);

		expect(called3).to.equal(true);
	});

	describe('via a RegEx', function () {
		it('should work with a text defined regex', async function () {
			let myType = null;
			let outside1 = null;
			let outside2 = null;

			obj.on(/foo/, (type, eins, zwei) => {
				myType = type;
				outside1 = eins;
				outside2 = zwei;
			});

			await obj.trigger('oh-foo-sur', 1, 2);

			expect(outside1).to.equal(1);

			expect(outside2).to.equal(2);

			expect(myType).to.equal('oh-foo-sur');

			await obj.trigger('foobar', 3, 4);

			expect(outside1).to.equal(3);

			expect(outside2).to.equal(4);

			expect(myType).to.equal('foobar');

			await obj.trigger('hello-world', 5, 6);

			expect(outside1).to.equal(3);

			expect(outside2).to.equal(4);

			let o1 = null;
			let o2 = null;
			obj.on(/./, function (_, v1, v2) {
				o1 = v1;
				o2 = v2;
			});

			await obj.trigger('bunch-of-junk', 10, 11);

			expect(o1).to.equal(10);

			expect(o2).to.equal(11);
		});
	});

	describe('via a function', function () {
		it('should always fire the test', async function () {
			let myType = null;
			let outside1 = null;
			let outside2 = null;

			obj.on(
				(event) => {
					expect(event).to.equal('hello-world');

					return true;
				},
				(type, eins, zwei) => {
					myType = type;
					outside1 = eins;
					outside2 = zwei;
				}
			);

			await obj.trigger('hello-world', 1, 2);

			expect(outside1).to.equal(1);

			expect(outside2).to.equal(2);

			expect(myType).to.equal('hello-world');
		});
	});
});
