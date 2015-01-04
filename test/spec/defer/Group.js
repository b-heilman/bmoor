describe("bmoor.defer.Group", function() {
	'use strict';
	
	var Basic,
		Group;

	beforeEach(bMoor.test.injector(['bmoor.defer.Basic','bmoor.defer.Group',function( B, G ){
		Basic = B;
		Group = G;
	}]));

	it("Should succeed on all successes", function() {
		var t,
			g = new Group(),
			d1 = new Basic(),
			d2 = new Basic(),
			d3 = new Basic();

		g.add( d1.promise );
		g.add( d2.promise );
		g.add( d3.promise );

		g.run();

		g.promise.then(
			function( v ){
				t = v;
			},
			function( v ){
				t = v;
			}
		);

		expect( t ).toBeUndefined();

		d1.resolve( true );
		d2.resolve( true );
		d3.resolve( true );

		expect( t ).toBe( true );
	});

	it("Should reject with only one rejection", function() {
		var t,
			g = new Group(),
			d1 = new Basic(),
			d2 = new Basic(),
			d3 = new Basic();

		g.add( d1.promise );
		g.add( d2.promise );
		g.add( d3.promise );

		g.run();

		g.promise.then(
			function( v ){
				t = v;
			},
			function( v ){
				t = v;
			}
		);

		expect( t ).toBeUndefined();

		d1.resolve( true );
		d2.reject( 'woot' );
		d3.resolve( true );

		expect( t ).toEqual( ['woot'] );
	});

	it("Should reject and join them together", function() {
		var t,
			g = new Group(),
			d1 = new Basic(),
			d2 = new Basic(),
			d3 = new Basic();

		g.add( d1.promise );
		g.add( d2.promise );
		g.add( d3.promise );

		g.run();

		g.promise.then(
			function( v ){
				t = v;
			},
			function( v ){
				t = v;
			}
		);

		expect( t ).toBeUndefined();

		d1.resolve( true );
		d2.reject( 'foo' );
		d3.reject( 'bar' );

		expect( t ).toEqual( ['foo','bar'] );
	});
});
