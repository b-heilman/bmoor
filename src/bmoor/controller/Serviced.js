;(function( $, global, undefined ){

var controllers = 0;

bMoor.constructor.decorator({
	name : 'Serviced',
	namespace : ['bmoor','controller'],
	onDefine : function( settings ){
		if ( settings.services ){
			if ( !this.services ){
				this.services = {};
			}

			for( service in settings.services ){
				this.services[ service ] = bMoor.get( settings.services[service] );
			}
		}
	},
	properties : {
		_finalize : function(){
			this.updates = {};
			this.removes = {};
			this.creates = {};
			
			if ( this.observer instanceof bmoor.observer.Collection ){
				this._bindCollection( this.observer );
			}else if ( this.observer ){
				this._bindMap( this.observer );
			}
			
			this._wrapped();
		},
		_delay : 2000,
		_bindMap : function( observer ){
			var 
				model = observer.model,
				dis = this,
				key = this._key,
				create = false,
				action,
				attr;

			if ( key ){
				if ( model[key] ){
					this._register( observer );
				}else{
					this._create( observer );
				}
			}else{
				this._register( observer );
			}
		},
		_bindCollection : function( collection ){
			var dis = this;

			collection.bind(function( alterations ){
				var
					i,
					c,
					additions,
					removals,
					row;

				additions = alterations.additions;
				removals = alterations.removals;

				// both of these come back as the models, reference the observer
				if ( removals ){
					for( i = 0, c = removals.length; i < c; i++ ){
						// TODO : Should I unbind somehow?
						dis._remove( removals[i]._ );
					}
				}

				if ( additions ){
					for( i = 0, c = additions.length; i < c; i++ ){
						dis._bindMap( additions[i]._ );
					}
				}
			});
		},
		_sendCreate : function( observer, cb ){ cb(); return; },
		_sendUpdate : function( observer, cb ){ cb(); return; },
		_sendRemove : function( observer, cb ){ cb(); return; },
		_get : function(){ return; },
		_register : function( observer ){
			var dis = this;

			observer.bind(function( settings ){ 
				dis._update( this, settings ); 
			}, true);
		},
		_create : function( observer ){
			var dis = this;
			
			this._register( observer );

			observer.run(function(){ 
				dis.creates[ this.snapid ] = this;
			});
			
			this._push();
		},
		_update : function( observer ){
			this.updates[ observer.snapid ] = observer;
			this._push();
		},
		_remove : function( observer ){
			this.removes[ observer.snapid ] = observer;
			this._push();
		},
		_push : function(){
			var dis = this;

			// if no delay, assume it will be something manual
			if ( this._delay ){
				if ( this._pushLock ){
					clearTimeout( this._pushLock );
				}

				this._pushLock = setTimeout(function(){
					dis._pushLock = null;
					dis.sendPush();
				}, this._delay);
			}
		},
		sendPush : function( cb ){
			// seperate the current back from any future
			var
				count = 1,
				creates = this.creates,
				removes = this.removes,
				updates = this.updates,
				snapid;

			// TODO : I really need to make this a pattern...
			function onReturn(){
				count--;
				
				if ( !count && cb ){
					cb();
				} 
			}
			
			this.creates = {};
			this.removes = {};
			this.updates = {};

			for( snapid in creates ){
				if ( !removes[snapid] ){
					// prevent a create / delete loop
					count++;
					this._sendCreate( creates[snapid], onReturn );
				}

				delete removes[snapid];
				delete updates[snapid];
			}
			
			for( snapid in updates ){
				if ( !removes[snapid] ){
					// prevent an unneeded update
					count++;
					this._sendUpdate( updates[snapid], onReturn );
				}
			}
			
			for( snapid in removes ){
				count++;
				this._sendRemove( removes[snapid], onReturn );
			}

			onReturn();
		}
	}
});

}( jQuery, this ));