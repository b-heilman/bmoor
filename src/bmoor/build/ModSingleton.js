(function( compiler ){

compiler.addModule( 5, 'bmoor.build.Singleton', ['singleton', 'mount', 'name', 
	function( singleton, namespace, name ){

	var obj = this,
		def;

	name = name.charAt(0).toLowerCase() + name.slice(1);
	
	if ( singleton ){
		if ( !bMoor.isArray(singleton) ){
			singleton = [];
		}

		singleton.$arguments = true;

		obj.$singleton = namespace[ name ] = new obj( singleton );
	}
}]);

}( bMoor.compiler ));