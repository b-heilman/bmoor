bMoor.make( 'bmoor.core.Collection', ['bmoor.core.Model', function( Model ){
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