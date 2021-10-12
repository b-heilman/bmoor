const {expect} = require('chai');
const sinon = require('sinon');

describe('bmoor.lib.logger', function () {
	const logger = require('./logger.js');
	const config = logger.config;

	const oldLog = config.get('log');
	const oldComment = config.get('comment');
	const oldLevel = config.get('level');

	beforeEach(function () {
		config.set('level', logger.levels.verbose);
	});

	afterEach(function () {
		config.set('log', oldLog);
		config.set('comment', oldComment);
		config.set('level', oldLevel);
	});

	describe('::log', function () {
		it('should call config log if called', function () {
			const spy = sinon.spy();

			config.set('log', spy);

			logger.log(logger.levels.error, 'something', {
				foo: 'bar'
			});

			expect(spy.getCall(0)).to.exist;

			const content = spy.getCall(0).args[0];

			expect(content.message).to.equal('something');

			expect(content.foo).not.to.exist;

			expect(content.type).to.equal('error');

			expect(content.timestamp).to.exist;
		});

		it('should not call if lower level', function () {
			const spy = sinon.spy();

			config.set('log', spy);

			config.set('level', logger.levels.error);
			logger.log(logger.levels.warn, 'something', {
				foo: 'bar'
			});

			expect(spy.getCall(0)).not.to.exist;
		});
	});

	describe('::comment', function () {
		it('should call config comment if called', function () {
			const spy = sinon.spy();

			config.set('comment', spy);

			logger.comment(logger.levels.error, 'something', 'foo bar');

			expect(spy.getCall(0)).to.exist;

			const content = spy.getCall(0).args[0];
			const comment = spy.getCall(0).args[1];

			expect(content.header).to.equal('something');

			expect(content.type).to.equal('error');

			expect(content.timestamp).to.exist;

			expect(comment).to.equal('foo bar');
		});

		it('should not call if lower level', function () {
			const spy = sinon.spy();

			config.set('comment', spy);

			config.set('level', logger.levels.error);
			logger.comment(logger.levels.warn, 'something', 'foo bar');

			expect(spy.getCall(0)).not.to.exist;
		});
	});

	describe('::error', function () {
		it('should handle a promise', async function () {
			let called = false;

			config.set('log', function () {
				return new Promise((resolve) => {
					setTimeout(() => {
						called = true;

						resolve(true);
					}, 100);
				});
			});

			config.set('level', logger.levels.error);
			await logger.error('something', {
				foo: 'bar'
			});

			expect(called).to.equal(true);
		});
	});
});
