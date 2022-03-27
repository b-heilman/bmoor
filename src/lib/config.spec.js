const {expect} = require('chai');

describe('bmoor.lib.config', function () {
	const {Config, ConfigObject} = require('./config.js');

	describe('basic functionality', function () {
		let cfg = null;

		beforeEach(function () {
			const otherSub = new Config({
				value: 'v-10'
			});

			cfg = new Config(
				{
					value: 'v-1',
					obj: new ConfigObject({
						hello: 'world',
						foo: 'bar'
					})
				},
				{
					sub: otherSub
				}
			);
		});

		it('should work with values', function () {
			expect(cfg.get('value')).to.equal('v-1');

			expect(cfg.keys()).to.deep.equal([
				'value',
				'obj'
			]);

			expect(cfg.get('obj').hello).to.equal('world');
			expect(cfg.get('obj').foo).to.equal('bar');
		});

		it('should work with subs', function () {
			expect(cfg.getSub('sub').get('value')).to.equal('v-10');
		});
	});

	describe('allow system configuration', function () {
		let cfg = null;
		let otherSub = null;

		beforeEach(function () {
			otherSub = new Config({
				value: 'v-10'
			});

			cfg = new Config(
				{
					value: 'v-1'
				},
				{
					sub: otherSub
				}
			);
		});

		it('should work with values', function () {
			cfg.set('value', 'v-100');

			expect(cfg.get('value')).to.equal('v-100');
		});

		it('should work with subs', function () {
			otherSub.set('value', 'v-101');

			expect(cfg.getSub('sub').get('value')).to.equal('v-101');
		});
	});

	describe('allow override by local settings', function () {
		let cfg = null;
		let otherSub = null;

		beforeEach(function () {
			otherSub = new Config({
				value: 'v-10',
				hello: {
					world: 'h-1'
				}
			});

			cfg = new Config(
				{
					value: 'v-1',
					foo: {
						bar: 'ok'
					}
				},
				{
					sub: otherSub
				}
			);
		});

		it('should work with values', function () {
			const myCfg = cfg.override({
				value: 'v-9'
			});

			expect(myCfg.get('value')).to.equal('v-9');

			expect(myCfg.get('foo.bar')).to.equal('ok');
		});

		it('should work with subs', function () {
			const myCfg = cfg.getSub('sub').override({
				value: 'v-9'
			});

			expect(myCfg.get('value')).to.equal('v-9');
			expect(myCfg.get('hello.world')).to.equal('h-1');
		});
	});
});
