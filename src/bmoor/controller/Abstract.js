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

		// set instreams or outstreams to be mapped
		this._inStreams = settings.inStreams || {};
		this._outStreams = settings.outStreams || {};

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
			var 
				dis = this,
				stream;

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
				if ( typeof(this._outStreams[stream]) == 'function' ){
					bmoor.lib.stream( stream ).bind( this.observer, {}, function(){
						dis._outStreams[stream].apply( dis, arguments ); 
					});
				}else{
					bmoor.lib.stream( stream ).bind( this.observer, {}, this._outStreams[stream] );
				}
			}
			
			this.root = this._findRoot() || this;

			if ( this._newRoot ){
				this._setRoot( this );
			}else{
				this._setRoot();
			}

			this._finalize();
		},
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
				model = this._model 
					? this._model( this['bmoor.lib.Snap']._initModel.call(this) ) 
					: this['bmoor.lib.Snap']._initModel.call( this );

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
			this['bmoor.lib.Snap']._initElement.call( this, element );
			
			element.controller = this;

			if ( this.baseClass ){
				element.className += ' '+this.baseClass;
			}
		},
		_finalize : function(){}
	}
});

}( jQuery, this ));