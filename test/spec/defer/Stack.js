describe("bmoor.defer.Stack", function() {
	'use strict';
	
	var Basic,
		Stack;

	beforeEach(bMoor.test.injector(['bmoor.defer.Basic','bmoor.defer.Stack',function( B, S ){
		Basic = B;
		Stack = S;
	}]));

	it("Should succeed on all successes", function() {
		var t,
			arr = [],
			g = new Stack(),
			d1 = new Basic();

		g.add(function(){
			arr.push( 1 );
		});
		g.add(function(){
			arr.push( 2 );
			return d1.promise;
		});
		g.add(function(){
			arr.push( 3 );
			return 'foobar';
		});

		expect( arr ).toEqual( [1,2] );

		g.run();

		d1.resolve( 'woot' );
		g.promise.then(function( v ){
			t = v;
		});

		expect( arr ).toEqual( [1,2,3] );
		expect( t ).toBe( 'foobar' );
	});

	it("Should reject with one rejection", function() {
		var t,
			arr = [],
			g = new Stack(),
			d1 = new Basic();

		g.add(function(){
			arr.push( 1 );
		});
		g.add(function(){
			arr.push( 2 );
			return d1.promise;
		});
		g.add(function(){
			arr.push( 3 );
		});

		expect( arr ).toEqual( [1,2] );
		
		g.run();

		d1.reject( 'woot' );
		g.promise.then(
			function( v ){
				t = v;
			},
			function( v ){
				t = v + ' - fail';
			}
		);

		expect( arr ).toEqual( [1,2] );
		expect( t ).toBe( 'woot - fail' );
	});
});
