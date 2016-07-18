describe("bmoor.string", function() {
	it("should operate trim correctly, default is white space", function(){
		var s = '  test    \n',
			t = bmoor.string.trim( s );

		expect( t ).toBe( 'test' );
	});

	it("should operate trim correctly, using 'a'", function(){
		var s = 'aatasteaaaa',
			t = bmoor.string.trim( s, 'a' );

		expect( t ).toBe( 'taste' );
	});

	it("should operate ltrim correctly, default is white space", function(){
		var s = '  test    \n',
			t = bmoor.string.ltrim( s );

		expect( t ).toBe( 'test    \n' );
	});

	it("should operate rtrim correctly, default is white space", function(){
		var s = '  test    \n',
			t = bmoor.string.rtrim( s );

		expect( t ).toBe( '  test' );
	});

	it("should externalize the filters", function(){
		expect( bmoor.string.getFormatter.filters ).toBeDefined();
	});

	it("should be able to parse commands", function(){
		var commands = bmoor.string.getCommands('eins:zwei :3| drei:foo:bar');

		expect( commands.length ).toBe( 2 );
		expect( commands[0].method ).toBe( 'eins' );
		expect( commands[0].args ).toEqual( ['zwei','3'] );
		expect( commands[1].method ).toBe( 'drei' );
		expect( commands[1].args ).toEqual( ['foo','bar'] );
	});

	it("should allow for adding filters", function(){
		var called = false,
			formatter;

		bmoor.string.getFormatter.filters.test1 = function( arg ){
			called = true;
			expect( arg ).toBe( 'arg' );

			return function( input ){
				expect( input ).toBe( 12 );
				return input+'w';
			}
		};
		bmoor.string.getFormatter.filters.test2 = function(){
			return function( input ){
				expect( input ).toBe( '12w' );
				return 'final';
			}
		};

		formatter = bmoor.string.getFormatter('- {{value|test1:arg|test2}} -');

		expect( formatter.$vars ).toEqual( ['value'] );
		expect( called ).toBe( true );
		expect( formatter({value:12}) ).toBe('- final -');
	});

	it("should stack multiple vars", function(){
		var formatter = bmoor.string.getFormatter('- {{value}} - {{foo.bar}} -');

		expect( formatter.$vars ).toEqual( ['foo.bar','value'] );
		expect( formatter({value:12,foo:{bar:10}}) ).toBe('- 12 - 10 -');
	});

	it("should allow for the building of formatted statements", function(){
		var formatter = bmoor.string.getFormatter('Hi {{name}} you owe {{cost|precision : 2|currency }}');

		expect( formatter({name:'Brian',cost:12.344123}) )
			.toBe('Hi Brian you owe $12.34');
	});

	it("should allow for the building of formatted statements - round up", function(){
		var formatter = bmoor.string.getFormatter('Hi {{name}} you owe {{cost|precision : 2|currency }}');

		expect( formatter({name:'Brian',cost:12.345123}) )
			.toBe('Hi Brian you owe $12.35');
	});

	it("should allow for the building of formatted statements - round up", function(){
		var formatter = bmoor.string.getFormatter('Hi {{name}} you owe {{cost|precision : 2|currency }}');

		expect( formatter({name:'Brian',cost:12.3}) )
			.toBe('Hi Brian you owe $12.30');
	});
});