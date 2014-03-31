bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	Compiler.$instance.addModule( 10, 'bmoor.build.ModProperties', 
		['-properties', function( properties ){
			var name;

			for( name in properties ){
				this.prototype[ name ] = properties[ name ];
			}
		}]
	);
}]);
