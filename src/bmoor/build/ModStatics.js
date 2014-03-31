bMoor.inject(['bmoor.build.Compiler', function( Compiler ){
	Compiler.$instance.addModule( 10, 'bmoor.build.ModStatics', 
		['-statics', function( statics ){
			var name;

			for( name in statics ){
				this.prototype[ name ] = statics[ name ];
			}
		}]
	);
}]);
