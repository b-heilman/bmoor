describe("Testing namespace functions", function() {
	it("should allow setting and getting aliases", function(){
		console.info( bMoor );
		bMoor.register('woot', 123);
		expect( bMoor.check('woot') ).toBe( 123 );
		expect( bMoor.check('woot2') ).toBe( undefined );
	});

	it("should parse namespaces correctly", function(){
		expect( bMoor.parse(null) ).toEqual( [] );
 		expect( bMoor.parse('eins.zwei') ).toEqual( ['eins','zwei'] );
 		expect( bMoor.parse(['derp','boo']) ).toEqual( ['derp','boo'] );
 		expect( bMoor.parse(1) ).toBe( 1 );
 		expect( bMoor.parse({}) ).toEqual( {} );
	});

	it("should allow getting and setting of variables", function(){
		var root = {};

		bMoor.set( 'derp',{}) ;
		bMoor.set( 'foo.bar', {eins:1,zwei:2} );
		bMoor.get( 'dis.dat' ).derp = 'yay';
		bMoor.set( 'foo.bar', {value:true} ,root );

		expect( foo.bar.eins ).toBe( 1 );
		expect( dis.dat.derp ).toBe( 'yay' );
		expect( root.foo.bar.value ).toBe( true );

		expect( bMoor.exists('derp2') ).toBe( null );
		expect( bMoor.get('derp') ).toEqual( {} );
	});
});
