;(function( $, global, undefined ){

bMoor.constructor.decorator({
	name : 'Decorator',
	namespace : ['bmoor','templating'],
	require : {
		references : { 'bMoor.module.Resource' : ['bmoor','lib','Resource'] }
	},
	properties : {
		prepared : {},
		get : function( id, data, raw ){
			return this.run( this.prepare(id,raw), data );
		},
		prepare : function( id, raw ){
			if ( raw ){
				return this._wrapped( id );
			}else{
				if ( !this.prepared[id] ){
					this.prepared[id] = this._wrapped( bMoor.module.Resource.loadTemplate(id) );
				}

				return this.prepared[id];
			}
		}
	}
});

}( jQuery, this ));