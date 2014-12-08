bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';

	compiler.addModule( 11, 'bmoor.build.ModExtend', 
		['-extend', function( extensions ){
			var i, c,
				proto = this.prototype;

			if ( extensions ){
				for( i = 0, c = extensions.length; i < c; i++ ){
					extensions[i]._extend( proto );
				}
			}
		}]
	);
}]);