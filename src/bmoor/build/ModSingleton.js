bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	'use strict';

	Compiler.$instance.addModule( -1, 'bmoor.build.ModSingleton', 
		['-singleton',function( singleton ){
			var obj = this;

			if ( singleton ){
				bMoor.iterate( singleton, function( args /* arguments to construct with */, name /* string */ ){
					obj[ '$'+name ] = bMoor.instantiate( obj, args );
				});
			}
		}]
	);
}]);