bMoor.make('bmoor.extender.Mixin', [
	function(){
		'use strict';

		return {
			construct : function Mixin(){
				throw 'You neex to extend Mixin, no instaniating it directly';
			},
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