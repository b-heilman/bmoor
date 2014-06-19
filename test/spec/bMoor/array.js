describe("Testing array functionality", function() {
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
});