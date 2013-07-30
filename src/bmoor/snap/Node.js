;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Node',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','lib','Snap'],
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
		
		this._attributes( attributes );
		this._element( element );
		this._template();
		this._model();
		
		this._binding();
		if ( !this.binded ){
			this._make( this.scope ); // binding will cause it to run otherwise
		}
	},
	properties : {
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
			this.$.data( 'node', this ); // TODO : kinda wanna get ride of this?

			this.__Snap._element.call( this, element );
			
			element.node = this;
			
			element.className += ' '+this.baseClass;
		},
		_model : function(){
			var 
				scope,
				variable;

			this.__Snap._model.call( this );

			variable = this._getAttribute( 'variable', this.element.name );

			// first try for variable
			if ( variable && typeof(variable) == 'string' ){
				scope = variable.split('.');

				this.variable = scope.pop();
				this.scope = this._unwrapVar( this.model, scope );
			}else{
				// otherwise check for scope
				scope = this._getAttribute( 'scope' );

				if ( scope ){
					this.scope = this._unwrapVar( this.model, scope );
				}else{
					// well, the model it is then
					this.scope = this.model;
				}

				this.variable = null;
			}

			// I'm pretty sure I want to slide the model down if the scope turns out to be a model itself?
			if ( this.scope._bind ){
				this.model = this.scope;
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
		_make : function( model ){
			var data = this.scope;

			// cleanse the data
			if ( this.variable ){
				data = data[this.variable];

				if ( typeof(data) == 'function' ){ data = this.scope[this.variable](); }
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
		}
	}
});

}( jQuery, this ));