(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		
		Compiler.$instance.addModule( 10, 'bmoor.build.ModStatics', ['-statics', function( statics ){
			var name;

			if ( bMoor.isInjectable(statics) ){
				statics = bMoor.inject( statics );
			}

			for( name in statics ){
				this.prototype[ name ] = statics[ name ];
			}
		}]);
	});

}());
