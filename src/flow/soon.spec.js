
describe('bmoor.flow.soon', function(){
	var timerCallback;
	
	beforeEach(function() {
		timerCallback = jasmine.createSpy("timerCallback");
		jasmine.clock().install();
	});

	afterEach(function() {
		jasmine.clock().uninstall();
	});

	it("should call a callback method within timeframe of first call", function() {
		var fn = bmoor.flow.soon(function() {
			timerCallback();
		}, 10);

		fn();
		expect(timerCallback).not.toHaveBeenCalled();

		fn();
		jasmine.clock().tick(9);
		expect(timerCallback).not.toHaveBeenCalled();

		jasmine.clock().tick(1);
		expect(timerCallback).toHaveBeenCalled();
		expect(timerCallback.calls.count()).toEqual(1);

		fn();
		jasmine.clock().tick(5);
		expect(timerCallback.calls.count()).toEqual(1);

		jasmine.clock().tick(5);
		expect(timerCallback.calls.count()).toEqual(2);
	});
});
