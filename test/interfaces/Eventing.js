describe('bmoor.interfaces.Eventing', function(){
	var obj,
		triggered,
		Eventing = bmoor.interfaces.Eventing;

	beforeEach(function(){
		obj = {};
		triggered = false;

		bmoor.build.mixin( obj, Eventing );

		obj.on('boom', function( args ){
			triggered = args;
		});
	});

	it('should work as a mixin', function(){
		expect( obj.on ).toBeDefined();
	});

	it('should properly trigger', function(){
		obj.trigger( 'boom', 'doop' );
		
		expect( triggered ).toBe('doop');
	});

	it('should pass in arguments', function(){
		var t = {};

		obj.trigger( 'boom', t );

		expect( triggered ).toBe( t );
	});

	it('should pass in arguments', function(){
		obj.trigger( 'foo', null );

		expect( triggered ).toBe( false );
	});

	it('should pass multiple arguments', function(){
		var eins,
			zwei;

		obj.on('foo', function( arg1, arg2 ){
			eins = arg1;
			zwei = arg2;
		});
		obj.trigger( 'foo', 'hello', 'world' );

		expect( eins ).toBe( 'hello' );
		expect( zwei ).toBe( 'world' );
	});
});