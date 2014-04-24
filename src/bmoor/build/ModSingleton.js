bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	Compiler.$instance.addModule( 5, 'bmoor.build.ModSingleton', 
		['-singleton','whenDefined',function( singleton, whenDefined ){
			var obj = this;

			if ( singleton ){
				bMoor.iterate( singleton, function( args /* arguments to construct with */, name /* string */ ){
					whenDefined.then(function(){
						obj[ '$'+name ] = bMoor.instantiate( obj, args );
					});
				});
			}
		}]
	);
}]);