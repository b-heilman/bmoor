(function(undefined){

describe("defer.Basic", function() {
	it("Should allow for a proper default chain", function() {
 		var 
 			arr = [],
			m = new bmoor.defer.Basic(function(){
				arr.push( 'some exception 1' );
			}),
			m2 = new bmoor.defer.Basic(function(){
				arr.push( 'some exception 2' );
			}),
			m3 = new bmoor.defer.Basic(function(){
				arr.push( 'some exception 3' );
			});

		m2.resolve('m2 - woot');
		m.promise
			.then(function(value){
				arr.push( value );
				return 'm1 - woot';
			})
			.then(function(value){
				arr.push( value );
				return m2.promise;
			})
			.then(function(value){
				arr.push( value );
				return m3.promise;
			})
			.then(function(value){
				arr.push( value );
				throw '--derp--';
			}).
			then(function(){
				arr.push( 'success' );
			},function(){
				arr.push( 'failure' );
			});

		m.resolve('hey');
		m3.resolve('m3 - woot');

		expect( arr ).toEqual([
			'hey',
			'm1 - woot',
			'm2 - woot',
			'm3 - woot',
			'failure',
			'some exception 1'
		]);
	});
});

}());
