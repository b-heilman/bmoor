bMoor.make( 'bmoor.data.Collection', 
	['bmoor.data.Model', 
	function( Model ){
		'use strict';
		
		return {
			construct : function Collection( content ){
				// I'm doing this because some things go nuts with just array like
				var key,
					t = [];
				
				this.$override.call( t, this.$inflate.call(t, content) );
			
				for( key in this ){
					t[ key ] = this[ key ];
				}

				return t;
			},
			mixins : [
				Model
			]
		};
	}]
);