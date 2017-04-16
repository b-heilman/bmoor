describe('bmoor.Eventing', function(){
	var obj,
		triggered,
		Eventing = bmoor.Eventing;

	beforeEach(function(){
		obj = new Eventing();
		triggered = false;

		obj.on('boom', function( args ){
			triggered = args;
		});
	});

	it('should work as a mixin', function(){
		expect( obj.on ).toBeDefined();
	});

	it('should properly trigger', function( done ){
		obj.trigger( 'boom', 'doop' );
		
		setTimeout(function(){
			expect( triggered ).toBe('doop');
			done();
		});
	});

	it('should pass in arguments', function( done ){
		var t = {};

		obj.trigger( 'boom', t );

		setTimeout(function(){
			expect( triggered ).toBe( t );
			done();
		});
	});

	it('should pass in arguments', function( done ){
		obj.trigger( 'foo', null );

		setTimeout(function(){
			expect( triggered ).toBe( false );
			done();
		});
	});

	it('should pass multiple arguments', function( done ){
		var eins,
			zwei;

		obj.on('foo', function( arg1, arg2 ){
			eins = arg1;
			zwei = arg2;
		});
		obj.trigger( 'foo', 'hello', 'world' );

		obj.on('stable', function(){
			expect( eins ).toBe( 'hello' );
			expect( zwei ).toBe( 'world' );

			done();
		});
	});
});