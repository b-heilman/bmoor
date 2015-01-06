bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( 90, 'bmoor.build.ModInherit', 
		['-id','-namespace','-name', '-mount','-parent',
		function( id, namespace, name, mount, parent ){
			var construct;

			if ( parent ){
				construct = this;

				this.prototype = bMoor.object.inherit( parent );
				this.prototype.constructor = construct;

				delete this.$generic;
			}
		}]
	);
}]);