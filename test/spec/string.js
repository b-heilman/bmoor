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
});