bMoor.define( 'bmoor.core.Collection', [function(){
	return {
		parent : 'Array',
		traits : [
			'bmoor.core.Model'
		],
		construct : function( content ){
			this.merge( this.inflate(content) );
		},
		properties : {
			simplify : function(){
				return this.deflate().hslice( 0 );
			}
		}
	};
}]);