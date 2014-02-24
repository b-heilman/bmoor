(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 8, 'bmoor.build.ModTraits', 
			['-traits', function( traits ){
			var proto = this.prototype;
			
			if ( traits ){
				if ( !bMoor.isArray( traits ) ){
					throw 'the traits list must be an array';
				}

				return bMoor.request( traits ).then(function( ts ){
					bMoor.loop( ts, function( trait ){
						if ( trait.$wrap ){
							trait.$wrap( proto );
						}
					});
				});
			}
		}]);
	});

}());
