bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';

	compiler.addModule( 1, 'bmoor.build.ModFinalize', 
		['-onMake', '-parent', function( onMake, parent ){
			if ( onMake ){
				this.$onMake = onMake;
			}else if ( parent ){
				this.$onMake = parent.$onMake;
			}
		}]
	);
}]);