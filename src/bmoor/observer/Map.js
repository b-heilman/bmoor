;(function( global, undefined ){
	var snapId = 0,
		instances = {};

	bMoor.define({
		name : 'snap.observer.Map',
		require : 'bmoor.core.Interval',
		construct : function( model ){
			this.snapId = snapId++;

			this.observe( model );
			this.start();
		},
		properties : {
			observe : function( model ){
				if ( this.model ){
					delete model._$[ this.snapId ];
				}

				this.model = model;

				if ( !model._$ ){
					model._$ = {};
				}

				model._$[ this.snapId ] = this;
			},
			watch : function( model, func ){
				
				// registers what the observe monitors 
			},
			check : function(){
				// see if anything has changed in the model
				this.checking = true;
			},
			notify : function(){
				// pushes out 
			},
			start : function(){
				instances[ this.snapId ] = thiss;
			},
			stop : function(){
				delete instances[ this.snapId ];
			}
		},
		postMake : function(){
			bmoor.core.Interval.set(function(){
				bMoor.iterate( instances, function( inst ){
					try{
						inst.check();
					}catch( e ){
						// I have no idea...
					}
				});
			}, 30);
		}
	});
/*
	bMoor.constructor.define({
		name : 'Map',
		namespace : ['snap','observer'],
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
				this.spy( model );
				model._ = this;
			},
			spy : function( model ){
				if ( this.model && this.model._ == this ){
					delete this.model._;
				}

				this.model = model;

				if ( !this.interval ){
					this.start();
				}else{
					this.flush( {modelSwitch:true} );
				}
			},
			simplify : function(){
				var 
					key,
					model = this.model,
					simple = {};

				// TODO : what about models inside of models?
				for( key in model ) if ( model.hasOwnProperty(key) && key[0] != '_' && key[0] != '$' ){
					val = model[ key ];

					if ( typeof(val) == 'function' ){
						val = model[ key ]();
					}

					simple[ key ] = val;
				}

				return simple;
			},
			isEmpty : function(){
				var 
					model = this.model,
					key;

				for( key in model ) if ( model.hasOwnProperty(key) && key[0] != '_' && key[0] != '$' ){
					return false;
				}

				return true;
			},
			start : function( interval ){
				var 
					dis = this,
					val;
				
				if ( !this.interval ){
					this._clean();
					
					this.flush( {start:true} );

					this.interval = setInterval( function(){ dis.flush( {} ); }, interval || 50 );
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
					for( key in settings ){
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
			_cleanse : function(){
				return this.model;
			},
			_clean : function(){
				var
					list,
					i,
					c,
					val,
					model = this._cleanse(),
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
*/
}( this ));
