bMoor.make( 'test.Composite', 
	['>test.Piece1','>test.Piece2', function( Piece1, Piece2 ){
		return {
			construct : function(){
				console.log( 'Composite.js' );
				new test.Piece1();
				new test.Piece2();
			}
		};
	}]
).then(function(){
	console.log('composite defined');
});