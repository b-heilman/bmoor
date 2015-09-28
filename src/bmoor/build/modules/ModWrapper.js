bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	// TODO : I'm not really sure what the heck I did this for?
	compiler.addModule( 89, 'bmoor.build.ModWrapper', 
		[ '-wrap',
		function( wrapped ){
			if ( wrapped ){
				this.prototype.$wrap = function(){
					var key,
						temp = bMoor.object.instantiate( wrapped, arguments );

					this.$wrapped = temp;

					function extend( dis, value, key ){
						if ( bMoor.isFunction(value) ){
							dis[ key ] = function(){
								return value.apply( temp, arguments );
							};
						}else{
							dis[ key ] = value;
						}
					}

					for( key in temp ){
						if ( !(key in this) ){
							extend( this, temp[key], key );
						}
					}
				};
			}
		}]
	);
}]);