bMoor.make('bmoor.extender.Mixin', [
	function(){
		'use strict';

		return {
			abstract: true,
			properties : {
				_$extend : function( obj ){
					var key;

					for( key in this ){
						if ( key.charAt(0) !== '_' || key.charAt(1) !== '$' ){
							obj[key] = this[key];
						}
					}
				}
			}
		};
	}]
);