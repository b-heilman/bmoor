(function(){

	bMoor.define( 'test.Composite', {
		require : [
			'test.Piece1',
			'test.Piece2'
		],
		construct : function(){
			console.log( 'Composite.js' );
			new test.Piece1();
			new test.Piece2();
		}
	}).$.promise.then(function(){
		console.log('composite defined');
	});

}());