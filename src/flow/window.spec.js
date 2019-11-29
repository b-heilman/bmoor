
const {expect} = require('chai');
const sinon = require('sinon');

describe('bmoor.flow.window', function(){
	const service = require('./window.js');

	let clock = null;
	function moveClock( increment ){
		clock.tick(increment);
	}

	let timerCallback = null;
	beforeEach(function() {
		timerCallback = sinon.spy();

		clock = sinon.useFakeTimers();
	});

	afterEach(function() {
		clock.restore();
	});

	it('should call a callback method within min edge of the window', function() {
		var fn = service(function() {
			timerCallback();
		}, 10, 30);

		fn();
		moveClock(5);
		expect(timerCallback.called).to.be.false;

		fn();
		moveClock(9);
		expect(timerCallback.called).to.be.false;

		moveClock(1);
		expect(timerCallback.called).to.be.true;
		expect(timerCallback.callCount).to.equal(1);

		fn();
		moveClock(5);
		expect(timerCallback.callCount).to.equal(1);

		moveClock(5);
		expect(timerCallback.callCount).to.equal(2);
	});

	it('should not be able to go over the max edge of the window', function() {
		var fn = service(function() {
			timerCallback();
		}, 10, 30);

		fn();
		moveClock(5);
		expect(timerCallback.called).to.be.false;

		fn();
		moveClock(9);
		expect(timerCallback.called).to.be.false;

		fn();
		moveClock(9);
		expect(timerCallback.called).to.be.false;

		fn();
		moveClock(9);
		expect(timerCallback.called).to.be.true;
		expect(timerCallback.callCount).to.equal(1);

		fn();
		moveClock(10);
		expect(timerCallback.callCount).to.equal(2);
	});
});
