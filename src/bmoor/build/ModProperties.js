bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( 10, 'bmoor.build.ModProperties', 
		['-properties', function( properties ){
			var name;

			for( name in properties ){
				this.prototype[ name ] = properties[ name ];
			}
		}]
	);
}]);