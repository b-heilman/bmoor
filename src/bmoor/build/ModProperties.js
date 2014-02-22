(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		
		Compiler.$instance.addModule( 10, 'bmoor.build.ModProperties', ['-properties', function( properties ){
			var name;

			if ( bMoor.isInjectable(properties) ){
				properties = bMoor.inject( properties );
			}

			for( name in properties ){
				this.prototype[ name ] = properties[ name ];
			}
		}]);
	});

}());
