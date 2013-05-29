;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'WaitFor',
	namespace : ['bmoor','lib'],
	construct: function(){},
	properties : {
		_waiting : 0,
		_done : null,
		_return : function(){
			this._waiting--;
			
			if ( this._done && this._waiting < 1 ){
				this._done();
				this._done = null;
			}
		},
		done : function( cb ){
			if ( this._waiting < 1 ){
				cb();
			}else{
				this._done = cb;
			}
		},
		require : function( requirements, cb ){
			var dis = this;
			
			this.waiting++;
			
			bMoor.autoload.require( requirements, function(){ if ( cb ){ cb(); } dis._return() } );
			
			return this;
		},
		loadScript : function( src, cb ){
			var dis = this;
			
			this.waiting++;
			
			bMoor.resource.loadScript( src, function(){ if ( cb ){ cb(); } dis._return() } );
			
			return this;
		},
		loadStyle : function( src, cb ){
			var dis = this;
			
			this.waiting++;
			
			bMoor.resource.loadStyle( src, function(){ if ( cb ){ cb(); } dis._return() } );
			
			return this;
		},
		loadImage : function( src, cb ){
			var dis = this;
			
			this.waiting++;
			
			bMoor.resource.loadImage( src, function(){ if ( cb ){ cb(); } dis._return() } );
			
			return this;
		},
		loadTemplate : function( id, src, cb ){
			var dis = this;
			
			this.waiting++;
			
			bMoor.resource.loadTemplate( id, src, function(){ if ( cb ){ cb(); } dis._return() } );
			
			return this;
		}
	}
});

}( jQuery, this ));