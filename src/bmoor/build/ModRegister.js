(function( bMoor, compiler ){

	compiler.addModule( 0, 'bmoor.build.Register', ['id', function( id ){
		bMoor.register( id, this );
	}]);

}( bMoor, bMoor.compiler ));
