const {expect} = require('chai');

describe('bmoor.data', function () {
	const bmoor = require('./index.js');

	it('should add a uid onto a object passed in', function () {
		var t = {},
			t2 = {};

		bmoor.data.setUid(t);

		expect(t.$$bmoorUid).to.equal(1);

		expect(bmoor.data.getUid(t)).to.equal(1);

		expect(bmoor.data.getUid(t2)).to.equal(2);
	});
});
