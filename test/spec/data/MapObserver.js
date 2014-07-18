describe( 'bmoor.data.MapObserver', function(){
	var Interval = bMoor.get('bmock.flow.Interval');

	bMoor.mock('bmoor.data.MapObserver', {
		'bmoor.flow.Interval' : Interval
	}).then(function( Mock ){
		var t,
			c1 = null,
			c2 = null,
			v1,
			v2,
			o1,
			o2,
			f = {
				eins : function( v, o ){
					c1 = true;
					v1 = v;
					o1 = o;
				},
				zwei : function( v, o ){
					c2 = true;
					v2 = v;
					o2 = o;
				}
			},
			o = {
				zwei : 2
			},
			interval = Interval;

		beforeEach(function(){
			interval.clearAll();

			t = new Mock( o );

			t.watch( 'eins', f.eins );
			t.watch( 'zwei', f.zwei );
		});

		it( 'watching data', function(){
			expect( v1 ).toBe( undefined );
			expect( o1 ).toBe( undefined );
			expect( v2 ).toBe( 2 );
			expect( o2 ).toBe( undefined );
		});

		it ( 'only run once every 30 ms', function(){
			o.eins = 1;
			o.zwei = 'two';

			interval.tick( 29 );

			expect( v1 ).toBe( undefined );
			expect( o1 ).toBe( undefined );
			expect( v2 ).toBe( 2 );
			expect( o2 ).toBe( undefined );
		});

		it ( 'run every 30 ms', function(){
			o.eins = 1;
			o.zwei = 'two';

			interval.tick( 30 );

			expect( v1 ).toBe( 1 );
			expect( o1 ).toBe( undefined );
			expect( v2 ).toBe( 'two' );
			expect( o2 ).toBe( 2 );
		});

		it ( 'not run if nothing changed', function(){
			c1 = null;
			c2 = null;
			interval.tick( 30 );

			expect( c1 ).toBe( null );
			expect( c2 ).toBe( null );
		});
		
		it ( 'run', function(){
			o.eins = 3;
			o.zwei = 3;
			c1 = null;
			c2 = null;
			interval.tick( 30 );

			expect( c1 ).toBe( true );
			expect( c2 ).toBe( true );
		});
	});
});
