;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Node',
	namespace : ['bmoor','snap'],
	require : {
		classes : [ 
			['bmoor','model','Map'],
			['bmoor','model','Collection']
		],
		references : { 
			'bMoor.module.Templator' : ['bmoor','templating','JQote'],
			'bMoor.module.Bootstrap' : ['bmoor','lib','Bootstrap']
 		}
	},
	onDefine : function( settings ){
		var 
			dis = this,
			node;
		// define object is the context
		// assume no singletons are getting called into this, can't think why they would...
		
		if ( settings.node ){
			node = settings.node;
			
			if ( node.className ){
				this.className = node.className;
				
				if ( this.baseClass ){
					if ( node.singleClass ){
						this.baseClass = node.className;
					}else{
						this.baseClass += ' ' + node.className;
					}
				}else{
					this.baseClass = node.className;
				}
			}
			
			$(document).ready(function(){
				var 
					act,
					className = '.'+dis.className,
					helpers = node.helpers ? node.helpers : {},
					makeGlobal = function( action, func ){
						// this seems highly inefficient, is there a better way?
						// -> maybe have the contructor build a list of all instances, keep it somewhere?
						$(document.body).on( action, function(event){
							func( event, $(className), helpers );
						});
					},
					// TODO : maybe subselect goes away from here and into the controller?
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
		this._model();
		
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

			// TODO : kinda wanna get ride of this?
			this.$.data( 'node', this );

			this.element = element;
			element.node = this;
			
			element.className += ' '+this.baseClass;
		},
		_model : function(){
			var 
				data,
				pos,
				args = [],
				scope,
				variable,
				controller,
				publishPath,
				publishName;

			this.model = this._findContext() || global;

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
			if ( !model || !model._bind ){
				if ( model.length ){
					this.model = new bmoor.model.Collection( model );
				}else{
					this.model = new bmoor.model.Map( model );
				}
			}else{
				this.model = model;
			}

			this.scope = scope;
			this.variable = variable;
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
			this._pushContext();

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

			this._finalize();
		},
		_setContent : function( content ){
			var 
				next,
				node,
				el = document.createElement( 'div' );

			el.innerHTML = content;

			this.element.innerHTML = '';

			node = el.firstChild;
			while( node ){
				next = node.nextSibling;

				this.element.appendChild( node );
				node = next;
			}
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
		_findContext : function(){
			var node = this.element;

			if ( !node.hasAttribute ){
				node = node[ 0 ];
			}

			while( node.tagName != 'HTML' ){
				if ( node.context ){ return node.context; }

				node = node.parentNode;
			}

			return null;
		},
		_pushContext : function( element, model ){
			if ( !element ){
				element = this.element;
			}

			if ( !model ){
				model = this.model;
			}

			if ( element.setAttribute ){
				// I am doing this right now to make it visually obvious where the context is in the DOM
				element.setAttribute( 'snap-context', null );
				element.context = model;
			}
		}
	}
});

}( jQuery, this ));