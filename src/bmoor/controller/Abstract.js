;(function( $, global, undefined ){

var controllers = 0;

bMoor.constructor.define({
	name : 'Abstract',
	namespace : ['bmoor','controller'],
	parent : ['bmoor','lib','Snap'],
	require : {
		classes : [ 
			['bmoor','lib','Stream'],
		]
	},
	onDefine : function( settings ){
		var 
			service,
			controller;

		if ( settings.functions ){
			this._functions = settings.functions;
		}
		
		// set instreams or outstreams to be mapped
		this._inStreams = settings.inStreams || {};
		this._outStreams = settings.outStreams || {};

		if ( settings.services ){
			if ( !this._ ){
				this._ = {};
			}

			for( service in settings.services ){
				this._[ service ] = bMoor.get( settings.services[service] );
			}
		}

		if ( settings.controller ){
			controller = settings.controller;


			if ( !controller.className ){
				controller.className = 'snap-controller'
			}

			// TODO : this could prolly be merges with Node's code
			this.className = controller.className; // TODO : auto gen this?
			
			if ( this.baseClass ){
				if ( controller.singleClass ){
					this.baseClass = controller.className;
				}else{
					this.baseClass += ' ' + controller.className;
				}
			}else{
				this.baseClass = controller.className;
			}

			$(document).ready(function(){
				var
					className = '.'+controller.className, 
					subselect,
					actions,
					action,
					create = function( action, subselect, func ){
						$(document.body).on( action, className+' '+subselect, function( event ){
							var
								node = this,
								controller,
								observer;

							observer = bmoor.lib.Snap.prototype._findElementWithProperty( 'observer', this );
							if ( $(observer).hasClass(className) ){
								controller = observer;
							}else{
								controller = $(this).closest( className )[0];
							}

							return func.call( this, event, controller.controller, observer.observer );
						});
					};

				for( action in controller.actions ){
					actions = controller.actions[ action ];

					for( subselect in actions ){
						create( action, subselect, actions[subselect] );
					}
				}
			});
		}
	},
	construct : function( element, attributes, arguments, delay ){
		this._parseAttributes( attributes );
		this._parseArguments.apply( this, arguments );
		
		if ( delay ){
			this.element = element;
		}else{
			this.init( element );
		}
	},
	properties : {
		init : function( element ){
			var stream;

			if ( !element ){
				element = this.element;
			}
			
			this._initElement( element );
		
			// call the model generator, allow it to return or set this.model
			this.observer = this._observe( this._initModel() );

			this._pushObserver( this.element, this.observer );

			for( stream in this._inStreams ){
				bmoor.lib.stream( stream ).bind( this.observer, this._inStreams[stream], this._outStreams[stream] );
			}

			for( stream in this._outStreams ) if ( !this._inStreams[stream] ){
				bmoor.lib.stream( stream ).bind( this.observer, {}, this._outStreams[stream] );
			}

			this.updates = {};
			this.removes = {};
			this.creates = {};
			
			if ( this.observer instanceof bmoor.observer.Collection ){
				this._bindCollection( this.observer );
			}else if ( this.observer ){
				this._bindMap( this.observer );
			}
			
			this.root = this._findRoot() || this;

			if ( this._newRoot ){
				this._setRoot( this );
			}else{
				this._setRoot();
			}

			this._finalize();
		},
		_delay : 2000,
		_key : null,
		_newRoot : false,
		_parseArguments : function(){
			// maybe arguments should really be a hash?
			// use json decode?
			this.args = arguments;
		},
		// make models observes that are then linked...
		_initModel : function(){
			var 
				info,
				attr,
				model = this._model ? this._model() : this.__Snap._initModel.call( this );

			attr = this._getAttribute( 'model' ); // allow redirecting the model
			
			if ( attr && typeof(attr) == 'string' ){
				info = this._unwrapVar( model, attr, true );

				if ( info ){
					model = info.value;
				}
			}

			return model;
		},
		_initElement : function( element ){
			this.__Snap._initElement.call( this, element );
			
			element.controller = this;

			if ( this.baseClass ){
				element.className += ' '+this.baseClass;
			}
		},
		_bindMap : function( observer ){
			var 
				model = observer.model,
				dis = this,
				key = this._key,
				create = false,
				action,
				attr;

			// TODO : foreach
			for( attr in this._functions ) if ( this._functions.hasOwnProperty(attr) ){ 
				model[ attr ] = this._functions[ attr ]; 
			}
			
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
		_finalize : function(){},
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

			/*
			TODO : do this correctly, also do onPush
			if ( this.model._.onPushBegin ){
				this.model._.onPushStart();
			}
			*/
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