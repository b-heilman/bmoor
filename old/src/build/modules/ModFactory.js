bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';

	compiler.addModule( 5, 'bmoor.build.ModFactory', 
		['-factory', function( factories ){
			var obj = this;

			if ( factories ){
				bMoor.iterate( factories, function( factory /* factory */, name /* string */ ){
					obj[ '$'+name ] = function(){
						return factory.apply( obj, arguments );
					};
				});
			}
		}]
	);
}]);