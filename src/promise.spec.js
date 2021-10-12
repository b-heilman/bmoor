const {expect} = require('chai');

describe('bmoor.promise', function () {
	const promise = require('./promise.js');

	describe('::stack', function () {
		it('should run correctly', function (done) {
			var calls = 0,
				stack = [];

			function add() {
				stack.push(function () {
					calls++;

					return Promise.resolve();
				});
			}

			while (stack.length < 10) {
				add();
			}

			promise.stack(stack).then(
				function () {
					expect(calls).to.equal(10); // all the methods called
					expect(stack.length).to.equal(10); // don't be destructive

					done();
				},
				function (ex) {
					console.log(ex.message);
					console.log(ex);
				}
			);
		});

		it('should run correctly, with staggered times', function (done) {
			var calls = 0,
				stack = [];

			function add() {
				stack.push(function () {
					calls++;

					return new Promise(function (resolve) {
						setTimeout(resolve, Math.random() * 100);
					});
				});
			}

			while (stack.length < 10) {
				add();
			}

			promise.stack(stack).then(
				function () {
					expect(calls).to.equal(10); // all the methods called
					expect(stack.length).to.equal(10); // don't be destructive

					done();
				},
				function (ex) {
					console.log(ex.message);
					console.log(ex);
				}
			);
		});

		it('should report back errors', function (done) {
			var calls = 0,
				stack = [];

			function add() {
				let fail = stack.length % 2 === 0;

				stack.push(function () {
					calls++;

					return new Promise(function (resolve, reject) {
						setTimeout(fail ? reject : resolve, Math.random() * 100);
					});
				});
			}

			while (stack.length < 100) {
				add();
			}

			let lastInfo;

			promise
				.stack(stack, {
					limit: 10,
					min: 30,
					max: 300,
					update: function (info) {
						lastInfo = info;

						expect(info.active).to.to.exist;
						expect(info.remaining).to.to.exist;
					}
				})
				.then(
					function () {
						console.log('should not be called');
					},
					function (errs) {
						expect(calls).to.equal(100); // all the methods called
						expect(stack.length).to.equal(100); // don't be destructive
						expect(errs.length).to.equal(50);

						setTimeout(function () {
							expect(lastInfo.active).to.equal(0);
							expect(lastInfo.remaining).to.equal(0);
							done();
						}, 301);
					}
				);
		});
	});
});
