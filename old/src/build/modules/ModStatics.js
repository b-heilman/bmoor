bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';

	compiler.addModule( 10, 'bmoor.build.ModStatics', 
		['-statics', function( statics ){
			var dis = this;

			if ( statics ){
				bMoor.iterate( statics, function( v, name ){
					dis[ name ] = v;
				});
			}
		}]
	);
}]);
