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

	it('should handle recursive events', function( done ){
		var step1 = false,
			step2 = false,
			stable = false;

		obj.on('stable', function(){
			stable = true;
			expect( step1 ).toBe( true );
			expect( step2 ).toBe( true );

			done();
		});

		obj.on('step-1', function(){
			step1 = true;

			expect( step2 ).toBe( false );
			expect( stable ).toBe( false );

			obj.trigger('step-2');
		});

		obj.on('step-2', function(){
			step2 = true;

			expect( stable ).toBe( false );
		});

		obj.trigger('step-1');
	});
});