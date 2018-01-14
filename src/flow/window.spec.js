
describe('bmoor.flow.window', function(){
	var timerCallback;

	function moveClock( increment ){
		jasmine.clock().tick(increment);
	}

	beforeEach(function() {
		timerCallback = jasmine.createSpy("timerCallback");

		jasmine.clock().install();
		jasmine.clock().mockDate( Date.now() );
	});

	afterEach(function() {
		jasmine.clock().uninstall();
	});

	it("should call a callback method within min edge of the window", function() {
		var fn = bmoor.flow.window(function() {
			timerCallback();
		}, 10, 30);

		fn();
		moveClock(5);
		expect(timerCallback).not.toHaveBeenCalled();

		fn();
		moveClock(9);
		expect(timerCallback).not.toHaveBeenCalled();

		moveClock(1);
		expect(timerCallback).toHaveBeenCalled();
		expect(timerCallback.calls.count()).toEqual(1);

		fn();
		moveClock(5);
		expect(timerCallback.calls.count()).toEqual(1);

		moveClock(5);
		expect(timerCallback.calls.count()).toEqual(2);
	});

	it("should not be able to go over the max edge of the window", function() {
		var fn = bmoor.flow.window(function() {
			timerCallback();
		}, 10, 30);

		fn();
		moveClock(5);
		expect(timerCallback).not.toHaveBeenCalled();

		fn();
		moveClock(9);
		expect(timerCallback).not.toHaveBeenCalled();

		fn();
		moveClock(9);
		expect(timerCallback).not.toHaveBeenCalled();

		fn();
		moveClock(9);
		expect(timerCallback).toHaveBeenCalled();
		expect(timerCallback.calls.count()).toEqual(1);

		fn();
		moveClock(10);
		expect(timerCallback.calls.count()).toEqual(2);
	});
});
