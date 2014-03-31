bMoor.inject(['bmoor.build.Compiler', function( Compiler ){
	Compiler.$instance.addModule( 8, 'bmoor.build.ModTraits', 
		['-traits', function( traits ){
			var proto = this.prototype;
			
			if ( traits ){
				if ( !bMoor.isArray( traits ) ){
					throw 'the traits list must be an array';
				}

				bMoor.loop( traits, function( trait ){
					if ( trait.$wrap ){
						trait.$wrap( proto );
					}
				});
			}
		}]
	);
}]);
