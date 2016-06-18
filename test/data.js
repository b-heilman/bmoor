describe("bmoor.data", function() {
	it("should add a uid onto a object passed in", function(){
		var t = {},
			t2 = {};

		bmoor.data.setUid( t );

		expect( t.$$bmoorUid ).toBe( 1 );

		expect( bmoor.data.getUid(t) ).toBe( 1 );

		expect( bmoor.data.getUid(t2) ).toBe( 2 );
	});
});