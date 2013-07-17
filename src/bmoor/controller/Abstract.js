;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Abstract',
	namespace : ['bmoor','controller'],
	construct : function( data ){
		if ( data instanceof bmoor.model.Collection ){
			this._collectionBind( data );
		}else if ( data._bind ){
			this._binding( data );
		}
	},
	properties : {
		service : '',
		_key : null,
		_binding : function( model ){
			var 
				dis = this,
				key = this._key,
				create = false;

			if ( key ){
				if ( model[key] ){
					this._register( model );
				}else{
					this._create( model );
				}
			}else{
				this._register( model );
			}
		},
		_collectionBind : function( collection ){
			var dis = this;

			collection._bind(function( alterations ){
				var
					additions,
					removals,
					row;

				additions = alterations.additions;
				removals = alterations.removals;

				for( var i in removals ){
					// TODO : Should I unbind somehow?
					dis._remove( removals[i] );
				}

				for( var i in additions ){
					dis._binding( additions[i] );
				}
			});
		},
		_register : function( model ){
			var dis = this;

			model._bind(function(){
				dis._post( this ); // post and updates
			}, true);
		},
		_create : function( model ){
			this._register( model );
		},
		_post : function( model ){},
		_remove : function( model ){},
		_get : function(){}
	}
});

}( jQuery, this ));