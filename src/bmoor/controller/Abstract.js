;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Abstract',
	namespace : ['bmoor','controller'],
	construct : function( model ){
		this.updates = {};
		this.removes = {};
		this.creates = {};

		this._model( model );

		if ( model instanceof bmoor.model.Collection ){
			this._collectionBind( model );
		}else if ( model._bind ){
			this._binding( model );
		}
	},
	onDefine : function( definition ){
		var service;

		if ( this.actions ){
			definition.prototype._actions = this.actions;
		}

		if ( this.services ){
			if ( !definition.prototype._ ){
				definition.prototype._ = {};
			}

			for( service in this.services ){
				definition.prototype._[ service ] = bMoor.get( this.services[service] );
			}
		}
	},
	properties : {
		delay : 2000,
		_key : null,
		_model : function( model ){
			this.model = model;
		},
		_binding : function( model ){
			var 
				dis = this,
				key = this._key,
				create = false,
				actions = model,
				action,
				attr;

			// TODO : foreach
			for( attr in this._actions ) if ( this._actions.hasOwnProperty(attr) ){ 
				actions[ attr ] = this._actions[ attr ]; 
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

			model._bind(function(){ dis._update( this ); }, true);
		},
		_create : function( model ){
			var dis = this;

			this._register( model );

			model._call(function(){ dis.creates[ this._.snapid ] = this._simplify(); });
			
			this._push();
		},
		_sendCreate : function( data ){
			throw 'Control needs _sendCreate defined: '+this.__name;
		},
		_update : function( model ){
			this.updates[ model._.snapid ] = model._simplify();
			this._push();
		},
		_sendUpdate : function( data ){
			throw 'Control needs _sendUpdate defined: '+this.__name;
		},
		_remove : function( model ){
			this.removes[ model._.snapid ] = model._simplify();
			this._push();
		},
		_sendRemove : function( data ){
			throw 'Control needs _sendRemove defined: '+this.__name;
		},
		_get : function(){
			throw 'Control needs _get defined: '+this.__name;
		},
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
				removes = this.removes,
				updates = this.updates,
				snapid;

			this.creates = {};
			this.removes = {};
			this.updates = {};

			for( snapid in creates ){
				if ( !removes[snapid] ){
					// prevent a create / delete loop
					this._sendCreate( creates[snapid] );
				}

				delete removes[snapid];
				delete updates[snapid];
			}

			for( snapid in updates ){
				if ( !removes[snapid] ){
					// prevent an unneeded update
					this._sendUpdate( updates[snapid] );
				}
			}

			for( snapid in removes ){
				this._sendRemove( removes[snapid] );
			}

			if ( this.model._.onPush ){
				this.model._.onPush();
			}
		}
	}
});

}( jQuery, this ));