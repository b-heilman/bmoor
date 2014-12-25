describe("Testing array functionality", function() {
	// compare
	it("should support the matching of two arrays", function(){
		var t = bMoor.array.compare(
			[
				{ val : 1 },
				{ val : 3 },
				{ val : 9 },
				{ val : 5 },
				{ val : 6 }
			],
			[
				{ val : 2 },
				{ val : 4 },
				{ val : 5 },
				{ val : 1 },
				{ val : 9 },
				{ val : 10 }
			],
			function( a, b ){
				return a.val - b.val;
			}
		);

		expect( t.left ).toEqual([
			{ val : 3 },
			{ val : 6 }
		]);

		expect( t.intersection.left ).toEqual([
			{ val : 1 },
			{ val : 5 },
			{ val : 9 }
		]);

		expect( t.intersection.right ).toEqual([
			{ val : 1 },
			{ val : 5 },
			{ val : 9 }
		]);

		expect( t.right ).toEqual([
			{ val : 2 },
			{ val : 4 },
			{ val : 10 }
		]);
	});

	// indexOf
	it("should support indexOf", function(){
		expect( bMoor.array.indexOf(['a','c','b','c'],'c') ).toBe( 1 );
		expect( bMoor.array.indexOf(['a','c','b','c'],'a') ).toBe( 0 );
		expect( bMoor.array.indexOf(['a','c','b','c'],'c',1) ).toBe( 1 );
		expect( bMoor.array.indexOf(['a','c','b','c'],'c',2) ).toBe( 3 );
		expect( bMoor.array.indexOf(['a','c','b','c'],'d') ).toBe( -1 );
		expect( bMoor.array.indexOf([1,2,3],3) ).toBe( 2 );
		expect( bMoor.array.indexOf([1,2,3],3,-2) ).toBe( 2 );
	});

	// remove
	it("should support remove", function(){
		expect( bMoor.array.remove(['a','c','b','c'],'a') ).toBe( 'a' );
		expect( bMoor.array.remove(['a','c','b','c'],'c') ).toBe( 'c' );
		expect( bMoor.array.remove(['a','c','b','c'],'d') ).toBeUndefined();
	});

	// removeAll
	it("should support removeAll", function(){
		expect( bMoor.array.removeAll(['a','c','b','c'],'a').length ).toBe( 1 );
		expect( bMoor.array.removeAll(['a','c','b','c'],'c').length ).toBe( 2 );
		expect( bMoor.array.removeAll(['a','c','b','c'],'d').length ).toBe( 0 );
	});

	// filter
	it("should support filter", function(){
		expect( bMoor.array.filter(['a','c','b','c'],function( x ){
			return x === 'a';
		}).length ).toBe( 1 );
		expect( bMoor.array.filter(['a','c','b','c'],function( x ){
			return x === 'c';
		}).length ).toBe( 2 );
		expect( bMoor.array.filter(['a','c','b','c'],function( x ){
			return x === 'd';
		}).length ).toBe( 0 );
	});
});
