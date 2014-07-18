bMoor.make( 'bmoor.data.Collection', 
	['bmoor.data.Model', 
	function( Model ){
		'use strict';
		
		return {
			mixins : [
				Model
			],
			construct : function Collection( content ){
				// I'm doing this because some things go nuts with just array like
				var key,
					t = [];

				for( key in this ){
					t[ key ] = this[ key ];
				}
				
				t.override( t.inflate(content) );
			
				return t;
			},
			properties : {
				simplify : function(){
					return this.deflate().slice( 0 );
				}
			}
		};
	}]
);