;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Abstract',
	namespace : ['bmoor','service'],
	construct : function(){
		if ( typeof(this._get) == 'string' ){
			this._get = this._parseService( this._get );
		}

		if ( typeof(this._update) == 'string' ){
			this._update = this._parseService( this._update );
		}

		if ( typeof(this._remove) == 'string' ){
			this._remove = this._parseService( this._remove );
		}

		if ( typeof(this._create) == 'string' ){
			this._create = this._parseService( this._create );
		}
	},
	properties : {
		_get    : null,
		_update : null,
		_remove : null,
		_create : null,
		_parseService : function( service ){
			return new Function( 'data', 'return "' + service.replace( /:([^\/?&]+)/g, '"+data.$1+"' ) + '";' );
		},
		_ajax : function( url, data ){
			$.ajax( url, { data : data });
		},
		create : function( data ){
			this._ajax( this._create(data), data );
		},
		update : function( data ){
			this._ajax( this._update(data), data );
		},
		remove : function( data ){
			this._ajax( this._remove(data), data );
		},
		get : function( data ){
			this._ajax( this._get(data), data );
		}
	}
});

}( jQuery, this ));