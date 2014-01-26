(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 0, 'bmoor.build.ModRegister', ['id', function( id ){
			bMoor.register( id, this );
		}]);
	});

}());
