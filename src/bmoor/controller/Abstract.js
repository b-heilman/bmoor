;(function( $, global, undefined ){

var controllers = 0;

bMoor.constructor.define({
	name : 'Abstract',
	namespace : ['bmoor','controller'],
	parent : ['bmoor','lib','Snap'],
	onDefine : function( settings ){
		var 
			service,
			controller;

		if ( settings.functions ){
			this._functions = settings.functions;
		}
		
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
							func.call( this, event, $(this).closest(className)[0].controller );
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
		this._attributes( attributes );
		this._arguments.apply( this, arguments );
		
		if ( delay ){
			this.element = element;
		}else{
			this.init( element );
		}
	},
	properties : {
		init : function( element ){
			if ( !element ){
				element = this.element;
			}
			
			this._element( element );
		
			// call the model generator, allow it to return or set this.model
			this.observer = this._observe( this._model() );
			this.scope = this.observer.model;

			this._pushObserver( this.element, this.observer );

			this.updates = {};
			this.removes = {};
			this.creates = {};
			
			if ( this.observer instanceof bmoor.observer.Collection ){
				this._collectionBind( this.observer );
			}else if ( this.observer ){
				this._binding( this.observer );
			}
			
			this.root = this._findRoot();

			if ( this._newRoot || !this.root ){
				this._setRoot( this );
			}else{
				this._setRoot();
			}

			this._finalize();
		},
		_delay : 2000,
		_key : null,
		_newRoot : false,
		_arguments : function(){
			// maybe arguments should really be a hash?
			// use json decode?
			this.args = arguments;
		},
		// make models observes that are then linked...
		_model : function(){
			var 
				info,
				attr,
				model = this.__Snap._model.call( this );

			attr = this._getAttribute( 'model' ); // allow redirecting the model
			
			if ( attr && typeof(attr) == 'string' ){
				info = this._unwrapVar( model, attr, true );

				if ( info ){
					model = info.value;
				}
			}

			return model;
		},
		_element : function( element ){
			this.__Snap._element.call( this, element );
			
			element.controller = this;

			if ( this.baseClass ){
				element.className += ' '+this.baseClass;
			}
		},
		_binding : function( observer ){
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
		_collectionBind : function( collection ){
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
						dis._binding( additions[i]._ );
					}
				}
			});
		},
		_sendCreate : function( data ){ return; },
		_sendUpdate : function( data ){ return; },
		_sendRemove : function( data ){ return; },
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
				dis.creates[ this.snapid ] = this.model;
			});
			
			this._push();
		},
		_update : function( observer ){
			this.updates[ observer.snapid ] = observer.model;
			this._push();
		},
		_remove : function( observer ){
			this.removes[ observer.snapid ] = observer.model;
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
				
				if ( !count ){
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