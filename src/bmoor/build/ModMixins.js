bMoor.inject(['bmoor.build.Compiler', function( Compiler ){
	'use strict';

	Compiler.$instance.addModule( 8, 'bmoor.build.ModMixins', 
		['-mixins', function( mixins ){
			if ( mixins ){
				if ( !bMoor.isArray( mixins ) ){
					mixins = [ mixins ];
				}else{
					mixins = mixins.splice(0);
				}

				mixins.unshift( this.prototype );

				bMoor.object.extend.apply( this, mixins );
			}
		}]
	);
}]);