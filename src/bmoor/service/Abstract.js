;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Abstract',
	namespace : ['bmoor','service'],
	onDefine : function( definition ){
		if ( typeof(definition.prototype._get) == 'string' ){
			definition.prototype._get = definition.prototype._parseService.call( this, definition.prototype._get );
		}

		if ( typeof(definition.prototype._update) == 'string' ){
			definition.prototype._update = definition.prototype._parseService.call( this, definition.prototype._update );
		}

		if ( typeof(definition.prototype._remove) == 'string' ){
			definition.prototype._remove = definition.prototype._parseService.call( this, definition.prototype._remove );
		}

		if ( typeof(definition.prototype._create) == 'string' ){
			definition.prototype._create = definition.prototype._parseService.call( this, definition.prototype._create );
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