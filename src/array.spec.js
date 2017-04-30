describe("bmoor.array", function() {
	// compare
	it("should support the matching of two arrays", function(){
		var t = bmoor.array.compare(
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
		expect( bmoor.array.indexOf(['a','c','b','c'],'c') ).toBe( 1 );
		expect( bmoor.array.indexOf(['a','c','b','c'],'a') ).toBe( 0 );
		expect( bmoor.array.indexOf(['a','c','b','c'],'c',1) ).toBe( 1 );
		expect( bmoor.array.indexOf(['a','c','b','c'],'c',2) ).toBe( 3 );
		expect( bmoor.array.indexOf(['a','c','b','c'],'d') ).toBe( -1 );
		expect( bmoor.array.indexOf([1,2,3],3) ).toBe( 2 );
		expect( bmoor.array.indexOf([1,2,3],3,-2) ).toBe( 2 );
	});

	// remove
	it("should support remove", function(){
		expect( bmoor.array.remove(['a','c','b','c'],'a') ).toBe( 'a' );
		expect( bmoor.array.remove(['a','c','b','c'],'c') ).toBe( 'c' );
		expect( bmoor.array.remove(['a','c','b','c'],'d') ).toBeUndefined();
	});

	// removeAll
	it("should support removeAll", function(){
		expect( bmoor.array.removeAll(['a','c','b','c'],'a').length ).toBe( 1 );
		expect( bmoor.array.removeAll(['a','c','b','c'],'c').length ).toBe( 2 );
		expect( bmoor.array.removeAll(['a','c','b','c'],'d').length ).toBe( 0 );
	});

	// filter
	it("should support filter", function(){
		expect( bmoor.array.filter(['a','c','b','c'],function( x ){
			return x === 'a';
		}).length ).toBe( 1 );
		expect( bmoor.array.filter(['a','c','b','c'],function( x ){
			return x === 'c';
		}).length ).toBe( 2 );
		expect( bmoor.array.filter(['a','c','b','c'],function( x ){
			return x === 'd';
		}).length ).toBe( 0 );
	});

	// bisect
	describe('bmoor.array.bisect', function(){
		it('should allow directly matching elements : center', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 13, function( x ){
				return x;
			});

			expect( t.left ).toBe( 3 );
			expect( t.right ).toBe( 3 );
		});

		it('should allow directly matching elements : center + 1', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 14, function( x ){
				return x;
			});

			expect( t.left ).toBe( 4 );
			expect( t.right ).toBe( 4 );
		});

		it('should allow directly matching elements : center + 2', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 15, function( x ){
				return x;
			});

			expect( t.left ).toBe( 5 );
			expect( t.right ).toBe( 5 );
		});

		it('should allow directly matching elements : center + 3', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 17, function( x ){
				return x;
			});

			expect( t.left ).toBe( 6 );
			expect( t.right ).toBe( 6 );
		});

		it('should allow directly matching elements : center + 1.5', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 13.5, function( x ){
				return x;
			});

			expect( t.left ).toBe( 3 );
			expect( t.right ).toBe( 4 );
		});

		it('should allow directly matching elements : center - 1', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 12, function( x ){
				return x;
			});

			expect( t.left ).toBe( 2 );
			expect( t.right ).toBe( 2 );
		});

		it('should allow directly matching elements : center - 2', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 11, function( x ){
				return x;
			});

			expect( t.left ).toBe( 1 );
			expect( t.right ).toBe( 1 );
		});

		it('should allow directly matching elements : center - 3', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 10, function( x ){
				return x;
			});

			expect( t.left ).toBe( 0 );
			expect( t.right ).toBe( 0 );
		});

		it('should not sort if already sorted', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			arr.sort = function(){
				t = true;
			};

			bmoor.array.bisect(arr, 10, function( x ){
				return x;
			}, true);

			expect( t ).toBeUndefined();
			expect( arr[1] ).toBe( 13 );
		});
	});
});
