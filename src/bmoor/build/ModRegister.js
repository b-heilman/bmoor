bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	'use strict';

	Compiler.$instance.addModule( 0, 'bmoor.build.ModRegister', 
		['-id', function( id ){
			bMoor.register( id, this );
		}]
	);
}]);