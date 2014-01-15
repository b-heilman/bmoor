describe("Testing the builds compiler", function() {
	var compiler,
		log;

	it("should allow the declaration of a Compiler", function(){
		compiler = new bmoor.build.Compiler();

		expect( compiler ).toBeDefined();
	});

	it("should allow plugins to be added", function(){
		compiler.addModule( 0, 'test.Foo', ['foo', function( foo ){
			log.push( foo );
		}] );

		compiler.addModule( 10, 'test.Bar', ['bar', function( bar ){
			log.push( bar );
		}] );

		compiler.addModule( -10, 'test.Foobar', ['foobar', function( foobar ){
			log.push( foobar );
		}] );

		expect( compiler.stack.length ).toBe( 3 );
	});

	it("should run plugins in the correct order", function(){
		log = [];

		compiler.make({
			name : 'Aname',
			foobar : 3,
			foo : 1,
			bar : 2
		});

		expect( log ).toEqual( [2,1,3] );
	});
});