describe('Testing bmoor.core.Interval', function(){
	var Interval = bmoor.core.Interval, 
		inst = Interval.$instance;

	it('should be defined', function(){
		expect( Interval ).toBeDefined();
		expect( inst ).toBeDefined();
		expect( inst.set ).toBeDefined();
		expect( bMoor.setInterval ).toBeDefined();
		expect( bMoor.clearInterval ).toBeDefined();
	});

});