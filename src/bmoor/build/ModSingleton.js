bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( -1, 'bmoor.build.ModSingleton', 
		['-singleton',function( singleton ){
			var t,
				obj = this;

			if ( singleton ){
				t = bMoor.object.instantiate( obj, [] );
				t.$constructor = obj;

				return t;
			}
		}]
	);
}]);