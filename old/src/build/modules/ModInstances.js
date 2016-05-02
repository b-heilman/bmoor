bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( -1, 'bmoor.build.ModInstances', 
		['-instances',function( instances ){
			var obj = this;

			if ( instances ){
				bMoor.iterate( instances, function( args /* arguments to construct with */, name /* string */ ){
					obj[ '$'+name ] = bMoor.instantiate( obj, args );
				});
			}
		}]
	);
}]);