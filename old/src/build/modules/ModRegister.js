bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( 0, 'bmoor.build.ModRegister', 
		['-id', function( id ){
			bMoor.register( id, this );
		}]
	);
}]);