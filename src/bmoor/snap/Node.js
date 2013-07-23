;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Node',
	namespace : ['bmoor','snap'],
	require : {
		classes : [ ['bmoor','model','Map'] ],
		references : { 
			'bMoor.module.Templator' : ['bmoor','templating','JQote'],
			'bMoor.module.Bootstrap' : ['bmoor','lib','Bootstrap']
 		}
	},
	onDefine : function( definition ){
		var node;
		// define object is the context
		// assume no singletons are getting called into this, can't think why they would...
		
		if ( this.node ){
			node = this.node;
			
			if ( node.className ){
				definition.prototype.className = node.className;
				
				if ( definition.prototype.baseClass ){
					if ( node.singleClass ){
						definition.prototype.baseClass = node.className;
					}else{
						definition.prototype.baseClass += ' ' + node.className;
					}
				}else{
					definition.prototype.baseClass = node.className;
				}
			}
			
			$(document).ready(function(){
				var 
					act,
					className = '.'+definition.prototype.className,
					helpers = node.helpers ? node.helpers : {},
					makeGlobal = function( action, func ){
						// this seems highly inefficient, is there a better way?
						// -> maybe have the contructor build a list of all instances, keep it somewhere?
						$(document.body).on( action, function(event){
							func( event, $(className), helpers );
						});
					},
					makeSplitAction = function( action, subselect, func ){
						if ( subselect == '' ){
							$(document.body).on( action, className, function( event ){
								func.call( this, event, $(this).data('node'), helpers );
							});
						}else{
							$(document.body).on( action, className+' '+subselect, function( event ){
								func.call( this, event, $(this).closest(className).data('node'), helpers );
							});
						}
					}, 
					makeAction = function( action, func ){
						if ( typeof(func) == 'function' ){
							$(document.body).on( action, className, function( event ){
								func.call( this, event, $(this).data('node'), helpers );
							});
						}else{
							for( var a in func ){
								makeSplitAction( action, a, func[a] );
							}
						}
					};
				
				// TODO : should prolly just make these an each
				for( var action in node.globals ){
					makeGlobal( action, node.globals[action] );
				}
				
				for( var action in node.actions ){
					makeAction( action, node.actions[action] );
				}
			});
		}
	},
	node : {
		className : 'snap-node'
	},
	construct : function( element, attributes ){
		this.binded = false;
		
		this._attributes = attributes;
		this._element( element );
		this._template();
		this._model( attributes ? attributes.context : undefined );
		
		this._binding();
		if ( !this.binded ){
			this._make( this.scope ); // binding will cause it to run otherwise
		}
	},
	properties : {
		getModel : function(){
			if ( this.model && this.model._bind ){
				return this.model;
			}else return null;
		},
		__warn : function( warning ){
			this__log( 'warn', warning );
		},
		__error : function( error ){
			this.__log( 'error', error );
			throw error;
		},
		__log : function(){
			console.log.apply( console, arguments );
		},
		_element : function( element ){
			this.$ = $( element );
			this.element = element;
			this.$.data( 'node', this );
			
			element.className += ' '+this.baseClass;
		},
		_wrapData : function( data ){
			return new bmoor.model.Map( data );
		},
		_model : function( context ){
			var 
				data,
				scope,
				variable,
				controller,
				publishPath,
				publishName;

			context = this.element.context || context || global;

			// TODO : make this model rather than data
			model = this._getAttribute( 'model' );
			if ( model ){
				if ( typeof(model) == 'string' ){
					model = this._unwrapVar( context, model );
				}
			}else{
				model = context;
			}

			variable = this._getAttribute( 'variable', this.element.name );

			if ( variable && typeof(variable) == 'string' ){
				scope = variable.split('.');
				variable = scope.pop();

				scope = this._unwrapVar( model, scope );
			}else{
				scope = model;
				variable = null;
			}

			// so now lets assign everything
			if ( !model || (typeof(model) == 'object' && !model._bind) ){
				this.model = this._wrapData( model );
			}else{
				this.model = model;
			}

			this.scope = scope;
			this.variable = variable;

			// publish any reference back to the context
			publishPath = this._getAttribute( 'publish' );
			if ( publishPath ){
				publishPath = publishPath.split('.');
				publishName = publishPath.pop();

				publishPath = this._unwrapVar( context, publishPath );
				publishPath[ publishName ] = this;
			}

			controller = this._getAttribute( 'controller' );
			if ( controller ){
				controller = bMoor.get( controller );
				this.controller = new controller( this.model );
			}else{
				this.controller = null;
			}
		},
		_template : function(){
			var template = this._getAttribute('template');

			if ( template ){
				this.prepared = bMoor.module.Templator.prepare( template );
			} else this.prepared = null;
		},
		_binding : function(){
			var dis = this;
			
			if ( this.model._bind ){
				this.binded = true;
				this.model._bind( function(){ dis._make( this ); });
			}
		},
		_make : function( data ){
			// cleanse the data
			if ( this.variable ){
				if ( this.scope ){
					data = this.scope[this.variable];

					if ( typeof(data) == 'function' ){ data = this.scope[this.variable](); }
				}else{
					data = null;
				}
			}

			if ( this.prepared ){
				this._setContent( bMoor.module.Templator.run(this.prepared,data) );
			}else if ( this.variable ){
				this._setContent( data );
			}

			this._pushContext();

			this._finalize();
		},
		_setContent : function( content ){
			this.element.innerHTML = content;
		},
		_finalize : function(){},
		_getAttribute : function( attribute, otherwise, adjustment ){
			var attr;
			
			if ( this._attributes && this._attributes[attribute] ){
				attr = this._attributes[attribute];
			}else{
				attribute = 'snap-'+attribute;
				
				if ( this.element.hasAttribute && this.element.hasAttribute(attribute) ){
					attr = this.element.getAttribute( attribute );
				}else return otherwise;
			}
			
			return adjustment ? adjustment( attr ) : attr;
		},
		_unwrapVar : function( context, variable ){
			var 
				path = typeof(variable) == 'string' ? variable.split('.') : variable,
				i,
				c;

			for( i = 0, c = path.length; i < c; i++ ){
				if ( context[path[i]] ){
					context = context[ path[i] ];
				}else return undefined;
			}

			return context;
		},
		_decodeData : function( variable ) {
			// TODO : prolly inline this
			return this._unwrapVar( this.model, variable );
		},
		// TODO : this should be renamed
		_decode : function( variable ){
			if ( typeof(variable) != 'string' ){
				return variable;
			}else if ( variable[0] == '{' || variable[0] == '[' ){
				return eval( variable );
			}else return eval( 'global.' + variable );
		},
		_select : function( selector, element ){
			if ( !element ){
				element = this.element;
			}

			if ( element.querySelectorAll ){
				return element.querySelectorAll( selector );
			}else{
				return $( element ).find( selector );
			}
		},
		_pushContext : function( element, model ){
			if ( !element ){
				element = this.element;
			}

			if ( !model ){
				model = this.model;
			}

			for( var nodes = this._select('[snap-class]', element), i = 0, c = nodes.length; i < c; i++){
				nodes[i].context = model;
			}
		}
	}
});

}( jQuery, this ));