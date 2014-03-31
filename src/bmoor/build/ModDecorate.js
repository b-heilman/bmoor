bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	Compiler.$instance.addModule( 9, 'bmoor.build.ModDecorate', 
		['-decorators', function( decorators ){
			var proto = this.prototype;

			if ( decorators ){
				if ( !bMoor.isArray( decorators ) ){
					throw 'the decoration list must be an array';
				}
				
				bMoor.loop( decorators, function( dec ){
					if ( dec.$wrap ){
						dec.$wrap( proto );
					}
				});
			}
		}]
	);
}]);
