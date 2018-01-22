describe('bmoor.Memory', function(){
	var obj,
		triggered,
		Memory = bmoor.Memory.Memory;

	beforeEach(function(){
		obj = new Memory();
	});

	it('should be able to import', function(){
		obj.import({'hello':'world'});

		expect( obj.get('hello') ).toBe('world');
	});

	it('should be able to export', function(){
		obj.register( 'hello', 'world' );

		expect( obj.get('hello') ).toEqual('world');
		expect( obj.export() ).toEqual({'hello':'world'});
	});
});
