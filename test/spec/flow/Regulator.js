describe( 'bmoor.flow.Regulator', function(){
	'use strict';
	
	var Timeout,
		Regulator,
		mountUp;

	beforeEach(bMoor.test.injector(
		['bmock.flow.Timeout', 'bmoor.flow.Timeout','bmoor.flow.Regulator',
		function( T, To, R ){
			Timeout = T;
			Regulator = R;
			mountUp = new Regulator( 30 );
		}],
		{
			'bmock.flow.Timeout' : 'bmoor.flow.Timeout'
		}
	));

	it ( 'should be defined', function(){
		expect( mountUp ).toBeDefined();
		expect( mountUp.cb ).toBe( null );
	});

	it ( 'should for no readjusting and contextual ', function(){
		var t = {
				c : null,
				f : function(){
					return this.c = 'woot';
				}
			},
			f = mountUp.setup( false, true );

		f( t, t.f );

		expect( t.c ).toBe( null );

		Timeout.tick( 20 );
		expect( t.c ).toBe( null );

		f( t, t.f );

		Timeout.tick( 20 );
		expect( t.c ).toBe( 'woot' );
	});

	it ( 'should for readjusting and contextual ', function(){
		var t = {
				c : null,
				f : function(){
					return this.c = 'woot';
				}
			},
			f = mountUp.setup( true, true );

		f( t, t.f );

		expect( t.c ).toBe( null );

		Timeout.tick( 20 );
		expect( t.c ).toBe( null );

		f( t, t.f );

		Timeout.tick( 20 );
		expect( t.c ).toBe( null );

		Timeout.tick( 20 );
		expect( t.c ).toBe( 'woot' );
	});

	it ( 'should for no readjusting and non-contextual ', function(){
		var c = null,
			f = mountUp.setup( false );

		f(function(){
			c = 'woot';
		});

		expect( c ).toBe( null );

		Timeout.tick( 20 );
		expect( c ).toBe( null );

		f(function(){
			c = 'test';
		});

		Timeout.tick( 20 );
		expect( c ).toBe( 'test' );
	});

	it ( 'should for readjusting and non-contextual ', function(){
		var c = null,
			f = mountUp.setup( true );

		f(function(){
			c = 'woot';
		});

		expect( c ).toBe( null );

		Timeout.tick( 20 );
		expect( c ).toBe( null );

		f(function(){
			c = 'test';
		});

		Timeout.tick( 20 );
		expect( c ).toBe( null );

		Timeout.tick( 20 );
		expect( c ).toBe( 'test' );
	});
});