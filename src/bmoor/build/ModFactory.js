(function( compiler ){

	compiler.addModule( 5, 'bmoor.build.ModFactory', ['factory', 'mount', 
		function( factory, namespace ){

		var obj = this,
			def;

		if ( factory ){
			namespace[ factory ] = function(){
				var args = arguments;
				args.$arguments = true;
				return new obj( args );
			};
		}
	}]);

}( bMoor.compiler ));