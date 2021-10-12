const {expect} = require('chai');

describe('bmoor.lib.error', function () {
	const error = require('./error.js');
	const {levels} = require('./logger.js');

	describe('::addStatus', function () {
		it('should add a ref, if not defined already', function () {
			const err = {};

			error.addStatus(err, {});

			expect(err.ref).to.exist;

			const ref = err.ref;

			error.addStatus(err, {});

			expect(err.ref).to.equal(ref);
		});

		it('should set type if status is defined', function () {
			const err = {};

			error.addStatus(err, {
				status: 101,
				type: levels.error
			});

			expect(err.status).to.equal(101);

			expect(err.type).to.equal(levels.error);

			error.addStatus(err, {
				status: 200,
				type: levels.warn
			});

			expect(err.status).to.equal(200);

			expect(err.type).to.equal(levels.warn);
		});
	});

	describe('::addTrace', function () {
		it('should overwrite and push old code to stack', function () {
			const err = {
				code: 200
			};

			error.addTrace(err, {
				code: 300,
				context: {}
			});

			error.addTrace(err, {
				code: 400,
				context: {
					foo: 'bar'
				},
				protected: {
					hello: 'world'
				}
			});

			error.setContext(err, {
				context: {
					eins: 1
				},
				protected: {
					zwei: 2
				}
			});

			expect(err.code).to.equal(400);

			expect(err.context).to.deep.equal({
				foo: 'bar',
				eins: 1
			});

			expect(err.protected).to.deep.equal({
				hello: 'world',
				zwei: 2
			});

			expect(err.trace).to.deep.equal([
				{
					code: 300,
					context: {},
					protected: {}
				},
				{
					code: 200,
					context: undefined,
					protected: undefined
				}
			]);
		});
	});

	describe('::addResponse', function () {
		it('should write if response is defined', function () {
			const err = {};

			error.addResponse(err, {
				response: 'hello',
				payload: {foo: 'bar'}
			});

			expect(err.response).to.equal('hello');

			expect(err.payload).to.deep.equal({foo: 'bar'});

			error.addResponse(err, {
				response: 'foobar',
				payload: {hello: 'world'}
			});

			expect(err.response).to.equal('foobar');

			expect(err.payload).to.deep.equal({hello: 'world'});
		});
	});

	describe('::apply', function () {
		it('should apply everything to a base object', function () {
			const err = {
				code: 200
			};

			error.apply(err, {
				status: 200,
				type: levels.warn,
				code: 301,
				context: {hello: 'world'},
				protected: {eins: 1},
				response: 'boom',
				payload: {foo: 'bar'}
			});

			expect(err.status).to.equal(200);

			expect(err.type).to.equal(levels.warn);

			expect(err.code).to.equal(301);

			expect(err.context).to.deep.equal({hello: 'world'});

			expect(err.protected).to.deep.equal({eins: 1});

			expect(err.trace).to.deep.equal([
				{
					code: 200,
					context: undefined,
					protected: undefined
				}
			]);

			expect(err.response).to.equal('boom');

			expect(err.payload).to.deep.equal({foo: 'bar'});

			// console.log(error.stringify(err));
		});

		it('should apply everything to a Error', function () {
			const err = new Error('oh, hey');

			error.apply(err, {
				code: 200
			});

			error.apply(err, {
				status: 200,
				type: levels.warn,
				code: 301,
				context: {hello: 'world'},
				protected: {eins: 1},
				response: 'boom',
				payload: {foo: 'bar'}
			});

			expect(err.status).to.equal(200);

			expect(err.type).to.equal(levels.warn);

			expect(err.code).to.equal(301);

			expect(err.context).to.deep.equal({hello: 'world'});

			expect(err.protected).to.deep.equal({eins: 1});

			expect(err.trace).to.deep.equal([
				{
					code: 200,
					context: {},
					protected: {}
				}
			]);

			expect(err.response).to.equal('boom');

			expect(err.payload).to.deep.equal({foo: 'bar'});

			// console.log(error.stringify(err));
		});
	});
});
