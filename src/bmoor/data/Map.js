bMoor.make( 'bmoor.data.Map', 
	['bmoor.data.Model', 
	function( Model ){
		'use strict';
		
		return {
			mixins : [
				Model
			],
			construct : function Map( content ){
				this.$override( this.$inflate(content) );
			}
		};
	}]
);

