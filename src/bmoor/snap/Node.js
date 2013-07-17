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
	construct : function( element, data, attributes ){
		this.binded = false;
		
		this._attributes = attributes;
		this._element( element );
		this._template();
		this._data( data );
		
		this._binding();
		if ( !this.binded ){
			this._make( this.data ); // binding will cause it to run otherwise
		}
	},
	properties : {
		getModel : function(){
			if ( this.data && this.data._bind ){
				return this.data;
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
			
			this.variable = this._getAttribute( 'variable', null );
			
			element.className += ' '+this.baseClass;
		},
		_wrapData : function( data ){
			return new bmoor.model.Map( data );
		},
		_data : function( data ){
			var controller;

			if ( !data || (typeof(data) == 'object' && !data._bind) ){
				this.data = this._wrapData( data );
			}else{
				this.data = data;
			}

			controller = this._getAttribute( 'controller' );
			if ( controller ){
				controller = bMoor.get( controller );
				this.controller = new controller( this.data );
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
			
			if ( this.data._bind ){
				this.binded = true;
				this.data._bind( function(){
					dis._make( this );
				});
			}
		},
		_make : function( data ){
			// cleanse the data
			data = this.variable ? ( data ? data[this.variable] : null ) : data;

			if ( this.prepared ){
				this._setContent( bMoor.module.Templator.run(this.prepared,data) );
				bmoor.lib.Bootstrap.setContext( this.element, data );
			}else if ( this.variable ){
				this._setContent( data );
			}

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
				
				if ( this.element.hasAttribute(attribute) ){
					attr = this.element.getAttribute( attribute );
				}else return otherwise;
			}
			
			return adjustment ? adjustment( attr ) : attr;
		},
		// TODO : this should be renamed
		_getVariable : function( variable ){
			if ( typeof(variable) != 'string' ){
				return variable;
			}else if ( variable[0] == '{' || variable[0] == '[' ){
				return eval( variable );
			}else return eval( 'global.' + variable );
		},
		_select : function( selector ){
			return bmoor.lib.Bootstrap.select( this.element, selector );
		}
	}
});

}( jQuery, this ));