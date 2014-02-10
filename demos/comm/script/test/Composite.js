(function(){

	bMoor.define({
		name : 'test.Composite',
		require : [
			'test.Piece1',
			'test.Piece2'
		],
		construct : function(){
			console.log( 'Composite.js' );
			new test.Piece1();
			new test.Piece2();
		}
	});

}());