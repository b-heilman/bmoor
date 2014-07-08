bMoor.make( 'bmoor.data.Collection', ['bmoor.data.Model', function( Model ){
	'use strict';
	
	return {
		parent : Array,
		traits : [
			Model
		],
		construct : function Collection( content ){
			this.merge( this.inflate(content) );
		},
		properties : {
			simplify : function(){
				return this.deflate().slice( 0 );
			}
		}
	};
}]);