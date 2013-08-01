;(function( $, global, undefined ){

var controllers = 0;

bMoor.constructor.define({
	name : 'Abstract',
	namespace : ['bmoor','controller'],
	parent : ['bmoor','lib','Snap'],
	require : {
		classes : [ 
			['bmoor','model','Map'],
			['bmoor','model','Collection']
		]
	},
	construct : function( element, attributes, arguments ){
		this._attributes( attributes );
		this._arguments.apply( this, arguments );
		this._element( element );
		
		// call the model generator, allow it to return or set this.model
		this.model = this._model() || this.model; 
		this._pushModel( this.element, this.model );

		this.updates = {};
		this.removes = {};
		this.creates = {};
		
		if ( this.model instanceof bmoor.model.Collection ){
			this._collectionBind( this.model );
		}else if ( this.model._bind ){
			this._binding( this.model );
		}

		// TODO : do I want to redirect the model to point back here automatically?  
		// I think model._.root should be directed by the controller itself...
		// models default to themselves, collections will point their children up the chain
		// controllers can redirect after that if they want...
		if ( !this._forwardRoot ){
			this.model._.root = this.model;
		}
	},
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
	properties : {
		_delay : 2000,
		_key : null,
		_forwardRoot : true,
		_arguments : function(){
			this.args = arguments;
		},
		_model : function(){
			var model;

			this.__Snap._model.call( this );

			model = this._getAttribute( 'model' );
			
			if ( model ){
				if ( typeof(model) == 'string' ){
					model = this._unwrapVar( this.model, model );
				}else{
					model = this.model;
				}
			}else{
				model = this.model;
			}

			if ( !model || !model._bind ){
				if ( model.length ){
					this.model = new bmoor.model.Collection( model );
				}else{
					this.model = new bmoor.model.Map( model );
				}
			}else{
				this.model = model;
			}
		},
		_element : function( element ){
			this.__Snap._element.call( this, element );
			
			element.controller = this;

			if ( this.baseClass ){
				element.className += ' '+this.baseClass;
			}
		},
		_binding : function( model ){
			var 
				dis = this,
				key = this._key,
				create = false,
				functions = model,
				action,
				attr;

			// TODO : foreach
			for( attr in this._functions ) if ( this._functions.hasOwnProperty(attr) ){ 
				functions[ attr ] = this._functions[ attr ]; 
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
					i,
					c,
					additions,
					removals,
					row;

				additions = alterations.additions;
				removals = alterations.removals;

				if ( removals ){
					for( i = 0, c = removals.length; i < c; i++ ){
						// TODO : Should I unbind somehow?
						dis._remove( removals[i] );
					}
				}

				if ( additions ){
					for( i = 0, c = additions.length; i < c; i++ ){
						dis._binding( additions[i] );
					}
				}
			});
		},
		_sendCreate : function( data ){ return; },
		_sendUpdate : function( data ){ return; },
		_sendRemove : function( data ){ return; },
		_get : function(){ return; },
		_register : function( model ){
			var dis = this;

			model._bind(function( settings ){ dis._update( this, settings ); }, true);
		},
		_create : function( model ){
			var dis = this;

			this._register( model );

			model._call(function(){ dis.creates[ this._.snapid ] = this._simplify(); });
			
			this._push();
		},
		_update : function( model ){
			this.updates[ model._.snapid ] = model._simplify();
			this._push();
		},
		_remove : function( model ){
			this.removes[ model._.snapid ] = model._simplify();
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
		sendPush : function(){
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