;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Abstract',
	namespace : ['bmoor','controller'],
	construct : function( model ){
		this.updates = {};
		this.deletes = {};
		this.creates = {};

		this.model = model;

		if ( data instanceof bmoor.model.Collection ){
			this._collectionBind( model );
		}else if ( model._bind ){
			this._binding( model );
		}
	},
	onDefine : function( definition ){
		if ( this.actions ){
			definition.prototype._ = this.actions;
		}
	},
	properties : {
		delay : 2000,
		url : {
			"get"    : '',
			"update" : '',
			"delete" : '',
			"create" : ''
		},
		_key : null,
		_binding : function( model ){
			var 
				dis = this,
				key = this._key,
				create = false,
				actions = model._,
				action,
				attr;

			// TODO : foreach, and I don't like this, seems slow?
			for( attr in this._ ){
				(function( action ){
					actions[ attr ] = function(){
						// apply all functionality to the cleanest data
						return action.apply( model._.old, arguments );
					};
				}( this._[ attr ] ));
			}

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
				dis._update( this ); // post and updates
			}, true);
		},
		_create : function( model ){
			var dis = this;

			this._register( model );

			model._call(function(){
				dis.creates[ this._.uuid ] = this;
			});
			
			this._push();
		},
		_sendCreate : function( data ){},
		_update : function( data ){
			this.updates[ data._.uuid ] = data;
			this._push();
		},
		_sendUpdate : function( data ){},
		_delete : function( data ){
			this.deletes[ data._.uuid ] = data;
			this._push();
		},
		_sendDelete : function( data ){},
		_get : function(){},
		_push : function(){
			var dis = this;

			if ( this._pushLock ){
				clearTimeout( this._pushLock );
			}

			this._pushLock = setTimeout(function(){
				dis._pushLock = null;
				dis._sendPush();
			}, this.delay);
		},
		_sendPush : function(){
			// seperate the current back from any future
			var
				creates = this.creates,
				deletes = this.deletes,
				updates = this.updates,
				uuid;

			this.creates = {};
			this.deletes = {};
			this.updates = {};

			for( uuid in creates ){
				if ( !deletes[uuid] ){
					// prevent a create / delete loop
					this._sendCreate( creates[uuid] );
				}

				delete deletes[uuid];
				delete updates[uuid];
			}

			for( uuid in updates ){
				if ( !deletes[uuid] ){
					// prevent an unneeded update
					this._sendUpdate( updates[uuid] );
				}
			}

			for( uuid in deletes ){
				this._sendDelete( deletes[uuid] );
			}

			if ( this.model._.onPush ){
				this.model._.onPush();
			}
		}
	}
});

}( jQuery, this ));