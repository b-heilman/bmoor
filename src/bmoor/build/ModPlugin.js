bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';
	
	compiler.addModule( 11, 'bmoor.build.ModPlugin', 
		['-plugins', function( decorators ){
			var i, c,
				proto = this.prototype;

			if ( decorators ){
				for( i = 0, c = decorators.length; i < c; i++ ){
					decorators[i]._target( proto );
				}
			}
		}]
	);
}]);