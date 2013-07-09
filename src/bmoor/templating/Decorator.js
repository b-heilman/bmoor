;(function( $, global, undefined ){

bMoor.constructor.decorator({
	name : 'Decorator',
	namespace : ['bmoor','templating'],
	require : {
		references : { 'bMoor.module.Resource' : ['bmoor','lib','Resource'] }
	},
	properties : {
		prepared : {},
		get : function( id, src, data, cb ){
			var dis = this;

			if ( cb == undefined && src !== null && typeof(src) != 'string' ){
				cb = data;
				data = src;
				src = null;
			}
			
			if ( cb ){
				this.prepare( id, src, function( prepared ){
					cb( dis.run(prepared,data) );
				});
				
				return null;
			}else{
				return this.run( this.prepare(id,src),data );
			}
		},
		prepare : function( id, src, cb ){
			// TODO : do I even need src anymore?  They should all be preloaded with ids
			var dis = this;

			if ( cb == undefined && src !== null && typeof(src) != 'string' ){
				cb = src;
				src = null;
			}

			if ( cb ){
				bMoor.module.Resource.loadTemplate( id, src, function( content ){
					if ( !dis.prepared[id] ){
						dis.prepared[id] = dis._wrapped( content );
					}
					
					cb( dis.prepared[id] );
				});
				
				return null;
			}else{
				if ( !this.prepared[id] ){
					this.prepared[id] = this._wrapped( bMoor.module.Resource.loadTemplate(id,src) );
				}
				
				return this.prepared[id];
			}
		},
		run : function( prepared, data, node ){
			return this._wrapped( prepared, data );
		}
	}
});

}( jQuery, this ));