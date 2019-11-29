
const {expect} = require('chai');

describe('bmoor.array', function() {

	const bmoor = require('./index.js');

	// compare
	it('should support the matching of two arrays', function(){
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

		expect( t.left ).to.deep.equal([
			{ val : 3 },
			{ val : 6 }
		]);

		expect( t.intersection.left ).to.deep.equal([
			{ val : 1 },
			{ val : 5 },
			{ val : 9 }
		]);

		expect( t.intersection.right ).to.deep.equal([
			{ val : 1 },
			{ val : 5 },
			{ val : 9 }
		]);

		expect( t.right ).to.deep.equal([
			{ val : 2 },
			{ val : 4 },
			{ val : 10 }
		]);
	});

	// remove
	it('should support remove', function(){
		expect( bmoor.array.remove(['a','c','b','c'],'a') ).to.equal( 'a' );
		expect( bmoor.array.remove(['a','c','b','c'],'c') ).to.equal( 'c' );
		expect( bmoor.array.remove(['a','c','b','c'],'d') ).to.not.exist;
	});

	// removeAll
	it('should support removeAll', function(){
		expect( bmoor.array.removeAll(['a','c','b','c'],'a').length ).to.equal( 1 );
		expect( bmoor.array.removeAll(['a','c','b','c'],'c').length ).to.equal( 2 );
		expect( bmoor.array.removeAll(['a','c','b','c'],'d').length ).to.equal( 0 );
	});

	// bisect
	describe('bmoor.array.bisect', function(){
		it('should allow directly matching elements : center', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 13, function( x ){
				return x;
			});

			expect( t.left ).to.equal( 3 );
			expect( t.right ).to.equal( 3 );
		});

		it('should allow directly matching elements : center + 1', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 14, function( x ){
				return x;
			});

			expect( t.left ).to.equal( 4 );
			expect( t.right ).to.equal( 4 );
		});

		it('should allow directly matching elements : center + 2', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 15, function( x ){
				return x;
			});

			expect( t.left ).to.equal( 5 );
			expect( t.right ).to.equal( 5 );
		});

		it('should allow directly matching elements : center + 3', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 17, function( x ){
				return x;
			});

			expect( t.left ).to.equal( 6 );
			expect( t.right ).to.equal( 6 );
		});

		it('should allow directly matching elements : center + 1.5', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 13.5, function( x ){
				return x;
			});

			expect( t.left ).to.equal( 3 );
			expect( t.right ).to.equal( 4 );
		});

		it('should allow directly matching elements : center - 1', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 12, function( x ){
				return x;
			});

			expect( t.left ).to.equal( 2 );
			expect( t.right ).to.equal( 2 );
		});

		it('should allow directly matching elements : center - 2', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 11, function( x ){
				return x;
			});

			expect( t.left ).to.equal( 1 );
			expect( t.right ).to.equal( 1 );
		});

		it('should allow directly matching elements : center - 3', function(){
			var t,
				arr = [10,13,14,11,12,15,17];

			t = bmoor.array.bisect(arr, 10, function( x ){
				return x;
			});

			expect( t.left ).to.equal( 0 );
			expect( t.right ).to.equal( 0 );
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

			expect( t ).to.not.exist;
			expect( arr[1] ).to.equal( 13 );
		});
	});

	describe('::unique', function(){
		it('should make an unique array with no helper methods', function(){
			expect( bmoor.array.unique([1,2,3,4,5,1,2,7,1,2,5,8]) )
			.to.deep.equal([1,2,3,4,5,7,8]);
		});

		it('should not run sort if true is passed', function(){
			expect( bmoor.array.unique([1,1,1,2,2,3,4,5,5],true) )
			.to.deep.equal([1,2,3,4,5]);
		});

		it('should use the sort method if passed', function(){
			expect( bmoor.array.unique([1,2,3,4,5,1,2,5], (a,b) => a-b) )
			.to.deep.equal([1,2,3,4,5]);
		});

		it('should apply sort and uniqueness', function(){
			expect( 
				bmoor.array.unique(
					[{x:1},{x:2},{x:3},{x:4},{x:5},{x:1},{x:2},{x:5}], 
					(a,b) => a.x-b.x,
					d => d.x
				)
			).to.deep.equal([{x:1},{x:2},{x:3},{x:4},{x:5}]);
		});

		it('should use uniqueness without sort', function(){
			expect( 
				bmoor.array.unique(
					[{x:1},{x:2},{x:3},{x:4},{x:5},{x:1},{x:2},{x:5}], 
					false,
					d => d.x
				)
			).to.deep.equal([{x:1},{x:2},{x:3},{x:4},{x:5}]);
		});
	});

	describe('::intersection', function(){
		it('should properly check intersection of two arrays', function(){
			expect(
				bmoor.array.intersection(
					[1,2,3,4,5,6],
					[2,3,4,7,8]
				)
			).to.deep.equal([2,3,4]);
		});
	});

	describe('::difference', function(){
		it('should properly check difference of two arrays', function(){
			expect(
				bmoor.array.difference(
					[1,2,3,4,5,6],
					[2,3,4,7,8]
				)
			).to.deep.equal([1,5,6]);
		});
	});

	describe('::watch', function(){
		it('should wrap interfaces to arrays to broadcast changes', function(){
			var arr = [1,2,3,4,5,6];
			var inserted = [];
			var removed = [];

			bmoor.array.watch(
				arr,
				function(datum){
					inserted.push(datum);
				},
				function(datum){
					removed.push(datum);
				}
			);

			arr.unshift(-1,0);
			arr.push(7);

			expect(arr.slice(0)).to.deep.equal([-1,0,1,2,3,4,5,6,7]);
			expect(inserted).to.deep.equal([-1,0,7]);

			arr.pop();
			arr.shift();

			arr.splice(1,2);

			expect(arr.slice(0)).to.deep.equal([0,3,4,5,6]);
			expect(removed).to.deep.equal([7,-1,1,2]);
		});

		it('should preload', function(){
			var arr = [1,2,3,4,5,6];
			var inserted = [];
			var removed = [];

			bmoor.array.watch(
				arr,
				function(datum){
					inserted.push(datum);
				},
				function(datum){
					removed.push(datum);
				},
				true
			);

			expect(arr.slice(0)).to.deep.equal([1,2,3,4,5,6]);
			expect(inserted).to.deep.equal([1,2,3,4,5,6]);
			expect(removed).to.deep.equal([]);
		});
	});
});
