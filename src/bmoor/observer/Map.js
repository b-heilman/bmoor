;(function( global, undefined ){
	var snapid = 0;

	bMoor.constructor.define({
		name : 'Map',
		namespace : ['bmoor','observer'],
		// this will use the observer pattern to allow element to bind to a model
		construct : function( model ){
			this.snapid = snapid++;
			this.cleaned = {};
			this.listeners = [];
			this.interval = null;
			this.root = this;
			
			this.init( model );
		},
		properties : {
			init : function( model ){
				this.setModel( model );
			},
			setModel : function( model ){
				this.model = model;

				if ( !model._ ){
					model._ = this;
				}

				if ( !this.interval ){
					this.start();
				}else{
					this.flush( {modelSwitch:true} );
				}
			},
			simplify : function(){
				var 
					model = this.model,
					simple = {};

				// TODO : what about models inside of models?
				for( var key in model ) if ( model.hasOwnProperty(key) && key[0] != '_' && key[0] != '$' ){
					val = model[ key ];

					if ( typeof(val) == 'function' ){
						val = model[ key ]();
					}

					simple[ key ] = val;
				}

				return simple
			},
			isEmpty : function(){
				var model = this.model;

				for( var key in model ) if ( model.hasOwnProperty(key) && key[0] != '_' && key[0] != '$' ){
					return false;
				}

				return true
			},
			start : function( interval ){
				var 
					dis = this,
					val;
				
				if ( !this.interval ){
					this._clean();
					
					this.flush( {start:true} );

					this.interval = setInterval(function(){ dis.flush( {} ); }, interval || 50);
				}
				
				return this;
			},
			stop : function(){
				clearInterval( this.interval );
				this.interval = null;
				
				this.flush( {stop:true} );

				return this;
			},
			flush : function( settings ){
				var 
					changes,
					key;

				changes = this._clean();
				if ( this._needNotify(changes) ){
					for( var key in settings ){
						changes[ key ] = settings[ key ];
					}
					
					this._notify( changes );
				}
			},
			bind : function( func, noFlush ){
				this.listeners.push( func );
				
				// if we are running, then we should make a call back
				if ( !noFlush ){
					this._onBind( func );
				}
				
				return this;
			},
			_clean : function(){
				var
					list,
					i,
					c,
					val,
					model = this.model,
					changes = {},
					cleaned = this.cleaned;
				
				for( var key in model ) if ( model.hasOwnProperty(key) && key[0] != '_' ){
					val = model[key];

					if ( typeof(val) == 'function' ){
						continue;
					}else{
						// TODO : how do I detect deletion?
						if ( val !== cleaned[key] ){
							changes[ key ] = true;

							if ( val === undefined ){
								delete cleaned[ key ];
							}else{
								cleaned[ key ] = val;
							}
						}
					}
				}

				return changes;
			},
			_needNotify : function( changes ){
				return !$.isEmptyObject( changes );
			},
			run : function( func, changes ){
				func.call( this, changes );
			},
			_notify : function( changes ){
				var
					list,
					i,
					c;
				
				for( i = 0, list = this.listeners, c = list.length; i < c; i++ ){ 
					this.run( list[i], changes );
				}
				
				return this;
			},
			_onBind : function( func ){
				this.run( func, {binding:true} );
			}
		}
	});
}( this ));