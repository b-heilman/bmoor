;(function( $, global, undefined ){

var controllers = 0;

bMoor.constructor.define({
	name : 'Abstract',
	namespace : ['bmoor','controller'],
	require : {
		classes : [ ['bmoor','model','Map'] ]
	},
	construct : function(){
		this.updates = {};
		this.removes = {};
		this.creates = {};
		
		this.model = this._model();

		if ( this.model instanceof bmoor.model.Collection ){
			this._collectionBind( this.model );
		}else if ( this.model._bind ){
			this._binding( this.model );
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
		own : function( element ){ 
			this._element( element ); 
		},
		_delay : 2000,
		_key : null,
		_model : function(){ return new bmoor.model.Map(); },
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
		_element : function( element, model ){
			if ( !model ){
				model = this.model;
			}

			element.setAttribute( 'snap-context', null );
			element.context = model;
			element.controller = this;

			if ( this.baseClass ){
				element.className += ' '+this.baseClass;
			}
		},
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