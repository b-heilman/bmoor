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
			return new Function( 'model', 'return "' + service.replace( /:([^\/?&]+)/g, '"+model.$1+"' ) + '";' );
		},
		_ajax : function( url, controller, observer, data, cb ){
			var dis = this;

			$.ajax( url, {
				data : data,
				dataType : 'json',
				success : function( json ){
					if ( json ){
						if ( json.messages ){
							dis._setMessages( controller, json.messages ); // new array will be detected
						}

						if ( json.errors ){
							dis._setErrors( controller, json.errors ); // new array will be detected
						}

						if ( json.success && cb ){
							cb.call( controller, observer, json );
						}
					}
				}
			});
		},
		_setMessages : function( controller, messages ){
			var 
				model = controller.root.observer.model,
				$messages = model.$messages;

			if ( $messages ){
				model.$messages = $messages.concat( messages );
			}
		},
		_setErrors : function( controller, errors ){
			var 
				model = controller.root.observer.model,
				$errors = model.$errors;

			if ( $errors ){
				model.$errors = $errors.concat( errors );
			}
		},
		create : function( controller, observer, cb ){
			var data = observer.simplify();

			this._ajax( this._create(data), controller, observer, data, cb );
		},
		update : function( controller, observer, cb ){
			var data = observer.simplify();

			this._ajax( this._update(data), controller, observer, data, cb );
		},
		remove : function( controller, observer, cb ){
			var data = observer.simplify();

			this._ajax( this._remove(data), controller, observer, data, cb );
		},
		get : function( controller, observer, cb ){
			var data = observer.simplify();

			this._ajax( this._get(data), controller, observer, data, cb );
		}
	}
});

}( jQuery, this ));