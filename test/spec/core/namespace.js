describe("Testing namespace functions", function() {
	var _root = bMoor._root;

	// parseNS
	it("should parse namespaces correctly", function(){
		expect( bMoor.parseNS(null) ).toEqual( [] );
 		expect( bMoor.parseNS('eins.zwei') ).toEqual( ['eins','zwei'] );
 		expect( bMoor.parseNS(['derp','boo']) ).toEqual( ['derp','boo'] );
 		expect( bMoor.parseNS(1) ).toBe( 1 );
 		expect( bMoor.parseNS({}) ).toEqual( {} );
	});

	// dwrap
	it("should allow for values to be wrapped in a promise with dwrap", function(){
		var t = 'woot',
			p = bMoor.dwrap( t ),
			val;

		p.then( function( v ){
			val = v;
		});

		expect( val ).toBe( t );
	});

	// set
	// get
	it("should allow getting and setting of variables", function(){
		var root = {};

		bMoor.set( 'derp',{}) ;
		bMoor.set( ['foo','bar'], {eins:1,zwei:2} );
		bMoor.get( 'dis.dat' ).derp = 'yay';
		bMoor.set( 'foo.bar', {value:true} ,root );


		expect( _root.foo.bar.eins ).toBe( 1 );
		expect( _root.dis.dat.derp ).toBe( 'yay' );
		expect( root.foo.bar.value ).toBe( true );

		expect( bMoor.exists('derp2') ).toBe( undefined );
		expect( bMoor.get('derp') ).toEqual( {} );
	});

	// exists
	it("should allow for the checking the existance of variables", function(){
		var root = {};

		bMoor.set( 'foo', 'bar', root );

		expect( root.foo ).toBe( 'bar' );

		expect( bMoor.exists('foo',root) ).toBe( 'bar' );

		expect( bMoor.exists('foo2', root) ).toBe( undefined );
	});

	// del
	it("should allow for deleting of variables", function(){
		var root = {};

		bMoor.set( 'foo', 'bar', root );

		expect( root.foo ).toBe( 'bar' );

		expect( bMoor.del('foo',root) ).toBe( 'bar' );

		expect( bMoor.exists('foo', root) ).toBe( undefined );
	});

	// register
	// check
	it("should allow setting and getting aliases", function(){
		root = {};

		bMoor.register( 'woot', 123, root );
		expect( bMoor.check('woot', root) ).toBe( 123 );
		expect( bMoor.check('woot2', root) ).toBe( undefined );
	});

	// plugin
	it("should allow for installing plugins", function(){
		bMoor.plugin( 'junk', 'woot' );

		expect( bMoor.junk ).toBe( 'woot' );
	});

	// TODO : find and install, if they really need to exist...
});
