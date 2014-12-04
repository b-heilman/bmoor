bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';

	compiler.addModule( 11, 'bmoor.build.ModMixins', 
		['-mixins', function( mixins ){
			var i, c,
				proto = this.prototype;

			if ( mixins ){
				for( i = 0, c = mixins.length; i < c; i++ ){
					mixins[i]._target( proto );
				}
			}
		}]
	);
}]);