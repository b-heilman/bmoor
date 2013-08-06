;(function( $, global, undefined ){

var nodesCount = 0;

bMoor.constructor.define({
	name : 'Node',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','lib','Snap'],
	require : {
		classes : [ 
			['bmoor','observer','Map'],
			['bmoor','observer','Collection']
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
	construct : function( element, attributes, delay ){
		this._attributes( attributes );

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

			this.binded = false;
		
			this.nodeId = nodesCount++;
			
			this._element( element );
			this._template();

			this.observer = this._observe( this._model() );

			this._binding();

			this._finalize();
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
			this.$.data( 'node', this ); // TODO : kinda wanna get ride of this?

			this.__Snap._element.call( this, element );
			
			element.node = this;
			
			element.className += ' '+this.baseClass;
		},
		_model : function(){
			var 
				attr,
				info,
				scope,
				variable,
				model = this.__Snap._model.call( this );

			attr = this._getAttribute( 'observe' );
			if ( attr ){
				scope = attr.split('.');
				info = this._unwrapVar( model, scope, true );

				if ( info.value instanceof bmoor.observer.Map ){
					model = info.value.model;
				}else{
					throw 'Trying to observe, but no observer.Map found';
				}
			}else{
				attr = this._getAttribute( 'scope', this.element.name );
				
				if ( attr ){
					scope = attr.split('.');
					info = this._unwrapVar( model, scope, true );

					if ( !info ){
						// TODO : what do I do?
					}else if ( typeof(info.value) == 'object' ){
						// if scope is a model, make it he model we watch
						this.variable = null;
						model = info.value;
					}else{
						this.variable = info.variable;
						model = info.scope;
					}
				}
			}
			
			return model;
		},
		_template : function(){
			var template = this._getAttribute('template');

			if ( template ){
				this.prepared = bMoor.module.Templator.prepare( template );
			} else this.prepared = null;
		},
		_binding : function(){
			var dis = this;
			
			this.binded = true;


			this.bindings = this._makeBindings();

			this.observer.bind( function( alterations ){
				if ( dis._needUpdate(alterations) ) {
					dis._prep( this.model, alterations );
				}
			});
		},
		_makeBindings : function(){
			var attr = this._getAttribute('binding');

			// control when this node updates itself
			if ( attr ){
				if ( attr[0] == '-' ){
					return [];
				}else if ( attr[0] == '*' ){
					return null;
				}else return attr.split(',');
			}else if ( this.variable ){
				return [ this.variable ];
			}else return [];
		},
		_needUpdate : function( alterations ){
			var 
				i,
				c,
				isNeeded,
				bindings = this.bindings;

			if ( bindings ){
				isNeeded = false;

				for( i = 0, c = bindings.length; i < c && !isNeeded; i++ ){
					isNeeded = alterations[ bindings[i] ];
				}
			}else{
				isNeeded = true;
			}
			
			return alterations.binding || isNeeded;
		},
		_prep : function( data, alterations ){
			if ( this.variable ){
				value = data[this.variable];

				if ( typeof(data) == 'function' ){ 
					value = data[this.variable](); 
				}
			}else{
				value = data;
			}

			this._make( value, alterations );
		},
		_make : function( data, alterations ){
			if ( this.prepared ){
				this._setContent( bMoor.module.Templator.run(this.prepared,data) );
			}else if ( this.variable ){
				this._setContent( data );
			}else{
				this._wrapElement( this.element );
			}
		},
		_setContent : function( content ){
			var 
				next,
				element,
				el = document.createElement( 'div' );

			el.innerHTML = content;

			this.element.innerHTML = '';

			element = el.firstChild;
			while( element ){
				next = element.nextSibling;
				
				this.element.appendChild( element );
				this._controlElement( element );

				this._wrapElement( element );

				element = next;
			}
		},
		_wrapElement : function( element ){},
		_controlElement : function( element ){
			if ( element.nodeType != 3 ){
				bMoor.module.Bootstrap.build( element );
			}
		},
		_finalize : function(){},
		_decodeData : function( variable ) {
			// TODO : prolly inline this
			return this._unwrapVar( this.observer.model, variable );
		},
		// TODO : this should be renamed
		_decode : function( variable ){
			if ( typeof(variable) != 'string' ){
				return variable;
			}else if ( variable[0] == '{' || variable[0] == '[' ){
				return eval( variable );
			}else return eval( 'global.' + variable );
		}
	}
});

}( jQuery, this ));