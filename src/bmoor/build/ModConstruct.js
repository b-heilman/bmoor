(function( compiler ){

	compiler.addModule( 20, 'bmoor.build.ModConstruct', ['construct', 'id', function( construct, id ){
		if ( construct ){
			this.prototype._construct = construct;
		}
	}]);

}( bMoor.compiler ));
