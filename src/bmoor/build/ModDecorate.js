(function( compiler ){

	compiler.addModule( 9, 'bmoor.build.Decorate', ['decorators', function( decorators ){
		var obj = this.prototype;

		if ( decorators ){
			if ( !bMoor.isArray( decorators ) ){
				throw 'the decoration list must be an array';
			}

			return bMoor.translate( decorators, true ).then(function( decs ){
				bMoor.loop( decs, function( dec ){
					if ( dec.$singleton ){
						dec.$singleton.$decorate( obj );
					}
				});
			});
		}
	}]);

}( bMoor.compiler ));
