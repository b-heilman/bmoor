bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( 10, 'bmoor.build.ModProperties', 
		['-properties', function( properties ){
			var proto = this.prototype;
			
			if ( properties ){
				bMoor.each( properties, function( prop, name ){
					proto[ name ] = prop;
				});
			}
		}]
	);
}]);