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
		_ajax : function( url, model, cb ){
			$.getJson( url, model._simplify(), function( json ){
				if ( json ){
					if ( json.success ){
						cb.call( model, json );
					}

					if ( json.messages ){
						this._setMessages( model, json.messages ); // new array will be detected
					}

					if ( json.errors ){
						this._setErrors( model, json.errors ); // new array will be detected
					}
				}
			});
		},
		_setMessages : function( model, messages ){
			if ( model.$messages ){
				model.$messages = messages;
			}
		},
		_setErrors : function( model, errors ){
			if ( model.$errors ){
				model.$errors = errors;
			}
		},
		create : function( model, cb ){
			this._ajax( this._create(model), model, cb );
		},
		update : function( model, cb ){
			this._ajax( this._update(model), model, cb );
		},
		remove : function( model, cb ){
			this._ajax( this._remove(model), model, cb );
		},
		get : function( model, cb ){
			this._ajax( this._get(model), model, cb );
		}
	}
});

}( jQuery, this ));