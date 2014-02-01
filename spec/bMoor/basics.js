describe("Testing basic functionality", function() {
	it("should facilitate the injection of variables into a function", function(){
		var uno,
			tres,
			root = {
				eins : 1, 
				zwei : {
					drei : 3
				}
			};

		bMoor.inject(['eins','zwei.drei', function(foo, bar){
			uno = foo;
			tres = bar;
		}], root);

		expect( uno ).toBe( 1 );
		expect( tres ).toBe( 3 );
	});
});