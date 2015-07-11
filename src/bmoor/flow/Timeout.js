bMoor.make( 'bmoor.flow.Timeout', 
	[
	function(){
		'use strict';

		return {
			construct : function Timeout(){
			},
			properties : {
				set : function( func, interval, ctx ){
					return setTimeout( function(){
						func.call( ctx );
					}, interval );
				},
				clear : function( timeoutId ){
					clearTimeout( timeoutId );
				}
			},
			singleton : true
		};
	}]
);