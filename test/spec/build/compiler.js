describe("Testing the builds compiler", function() {
	var compiler,
		log,
		space = {};

	it("should allow the declaration of a Compiler", function(){
		compiler = new bmoor.build.Compiler();

		expect( compiler ).toBeDefined();
	});

	it("should allow plugins to be added", function(){
		compiler.addModule( 0, 'test.Foo', ['foo', function( foo ){
			log.push( foo );
			this.prototype.foo = 'foo';
		}] );

		compiler.addModule( 10, 'test.Bar', ['bar', function( bar ){
			log.push( bar );
			this.prototype.bar = true;
		}] );

		compiler.addModule( -10, 'test.Foobar', ['foobar', function( foobar ){
			log.push( foobar );
			this.prototype.foobar = false;
		}] );

		expect( compiler.preProcess.length ).toBe( 2 );
		expect( compiler.postProcess.length ).toBe( 1 );
	});

	it("should run plugins in the correct order", function(){
		log = [];

		compiler.make( 'Aname', {
			foobar : 3,
			foo : 1,
			bar : 2
		}, space );

		expect( log ).toEqual( [2,1,3] );
		expect( space.Aname ).toBeDefined();
		expect( space.Aname.prototype.foo ).toBe( 'foo' );
		expect( space.Aname.prototype.bar ).toBe( true );
		expect( space.Aname.prototype.foobar ).toBe( false );
	});

	it("should allow previously defined objects to be mocked", function(){
		var t;

		log = [];

		compiler.mock( 'Aname', {
			foobar : 7,
			foo : 5,
			bar : 6
		}, space ).then(function( o ){
			t = o;
		});

		expect( log ).toEqual( [2,1,3] ); // because the original defintion doesn't inject
		expect( t ).toBeDefined();
		expect( t.prototype.foo ).toBe( 'foo' );
		expect( t.prototype.bar ).toBe( true );
		expect( t.prototype.foobar ).toBe( false );
	});

	it("should run allow for injection in defintions", function(){
		log = [];

		space.foobar = 3;
		space.foo = 1;
		space.bar = 2;

		compiler.make( 'Aname', ['foo', 'bar', 'foobar', function( f, b, fb ){
			return {
				foobar : fb,
				foo : f,
				bar : b
			}
		}], space );

		expect( log ).toEqual( [2,1,3] );
		expect( space.Aname ).toBeDefined();
		expect( space.Aname.prototype.foo ).toBe( 'foo' );
		expect( space.Aname.prototype.bar ).toBe( true );
		expect( space.Aname.prototype.foobar ).toBe( false );
	});

	it("should run allow for injection in mocks", function(){
		var t;

		log = [];

		space.foobar = 3;
		space.foo = 1;
		space.bar = 2;

		compiler.mock( 'Aname', {
			foobar : 7,
			bar : 6
		}, space ).then(function( o ){
			t = o;
		});

		expect( log ).toEqual( [6,1,7] );
		expect( t ).toBeDefined();
		expect( t.prototype.foo ).toBe( 'foo' );
		expect( t.prototype.bar ).toBe( true );
		expect( t.prototype.foobar ).toBe( false );
	});

	it("should run allow for defining constants", function(){
		compiler.define( 'Woot', 1, space );
		compiler.define( 'Foo', {}, space );
		compiler.define( 'Bar', true, space );

		expect( space.Woot ).toBe( 1 );
		expect( space.Foo ).toBeDefined();
		expect( space.Bar ).toBe( true );
	});
});