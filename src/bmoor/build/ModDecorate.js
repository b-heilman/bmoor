(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 9, 'bmoor.build.ModDecorate', 
			['-decorators', function( decorators ){
			var proto = this.prototype;

			if ( decorators ){
				if ( !bMoor.isArray( decorators ) ){
					throw 'the decoration list must be an array';
				}
				
				return bMoor.request( decorators ).then(function( decs ){
					bMoor.loop( decs, function( dec ){
						if ( dec.$wrap ){
							dec.$wrap( proto );
						}
					});
				});
			}
		}]);
	});

}());
