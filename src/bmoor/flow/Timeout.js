bMoor.make( 'bmoor.flow.Timeout', 
	[
	function(){
		'use strict';

		return {
			construct : function Timeout(){
			},
			properties : {
				set : function( func, interval ){
					return setTimeout( func, interval );
				},
				clear : function( timeoutId ){
					clearTimeout( timeoutId );
				}
			},
			singleton : true
		};
	}]
);