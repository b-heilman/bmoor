describe("bMoor.data", function() {
	it("should add a uid onto a object passed in", function(){
		var t = {};

		bMoor.data.setUid( t );

		expect( bMoor.data.getUid(t) ).toBeDefined();
	});
});