bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';

	compiler.addModule( -100, 'bmoor.build.ModFinalize', 
		['-finalize', function( onMake ){
			if ( onMake ){
				onMake( this );
			}
		}]
	);
}]);