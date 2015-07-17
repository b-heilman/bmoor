describe( 'bmoor.flow.Regulator', function(){
	'use strict';
	
	var Timeout,
		Regulator,
		mountUp;

	beforeEach(bMoor.test.injector(
		['bmock.flow.Timeout', 'bmoor.flow.Regulator',
		function( T, R ){
			Timeout = T;
			Regulator = R;
		}],
		{
			'bmock.flow.Timeout' : 'bmoor.flow.Timeout'
		}
	));

	it ( 'should be defined', function(){
		expect( Regulator ).toBeDefined();
	});

	it ( 'should limit the calls to the low bounds', function(){
		var reg = new Regulator( 30, 500, function(v){
				return t.c = v;
			}),
			t = {
				c : null,
			};

		reg('woot');

		expect( t.c ).toBe( null );

		Timeout.tick( 20 );
		
		expect( t.c ).toBe( null );

		Timeout.tick( 20 );

		expect( t.c ).toBe( 'woot' );
	});

	it ( 'should reset the lower bounds timer on call', function(){
		var reg = new Regulator( 30, 500, function(v){
				return t.c = v;
			}),
			t = {
				c : null,
			};

		reg('woot');

		expect( t.c ).toBe( null );

		Timeout.tick( 20 );
		
		reg('woot');
		reg.shift( 5 );

		expect( t.c ).toBe( null );

		Timeout.tick( 20 );

		expect( t.c ).toBe( null );

		Timeout.tick( 40 );
		
		expect( t.c ).toBe( 'woot' );
	});

	it ( 'should be able to be flushed', function(){
		var reg = new Regulator( 30, 500, function(v){
				return t.c = v;
			}),
			t = {
				c : null,
			};

		reg('woot');

		expect( t.c ).toBe( null );

		reg.flush();

		expect( t.c ).toBe( 'woot' );
	});

	it ( 'should allow it to be cancelled', function(){
		var reg = new Regulator( 30, 500, function(v){
				return t.c = v;
			}),
			t = {
				c : null,
			};

		reg('woot');

		expect( t.c ).toBe( null );

		Timeout.tick( 20 );
		
		expect( t.c ).toBe( null );
		
		reg.clear();

		Timeout.tick( 20 );

		expect( t.c ).toBe( null );
	});
});