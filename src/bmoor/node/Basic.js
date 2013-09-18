;(function( $, global, undefined ){

var nodesCount = 0;

bMoor.constructor.define({
	name : 'Basic',
	namespace : ['bmoor','node'],
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
						this.baseClass = node.className + ' ' + this.baseClass;
					}
				}else{
					this.baseClass = node.className;
				}
			}
			
			$(document).ready(function(){
				var 
					act,
					className = '.'+dis.className.split(' ')[0], // the primary class should always be on the left
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
								func.call( this, event, this.node, helpers );
							});
						}else{
							$(document.body).on( action, className+' '+subselect, function( event ){
								func.call( this, event, $(this).closest(className)[0].node, helpers );
							});
						}
					}, 
					makeAction = function( action, func ){
						if ( typeof(func) == 'function' ){
							$(document.body).on( action, className, function( event ){
								func.call( this, event, this.node, helpers );
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
		className : 'node-basic'
	},
	construct : function( element, attributes, delay ){
		this._parseAttributes( attributes );
		
		if ( delay ){
			this.element = element;
		}else{
			this.init( element );
		}
	},
	properties : {
		defaultController : null, // remember to preload this
		init : function( element ){
			this.classBindings = [];
			this.makeClass = null;

			if ( !element ){
				element = this.element;
			}
			this.nodeId = nodesCount++;
			
			this._initElement( element );
			
			this.observer = this._observe( this._initModel() );
			this._pushObserver( this.element, this.observer );
			
			this._bind();

			this._finalize();
		},
		_initElement : function( element ){
			var 
				dis = this,
				controller,
				attr;

			this.$ = $( element );
			this.$.data( 'node', this ); // TODO : kinda wanna get ride of this?

			this['bmoor.lib.Snap']._initElement.call( this, element );

			element.node = this;

			// install a default controller
			// TODO : a better way to do this?
			if ( !element.controller && this.defaultController ){
				controller = bMoor.get( this.defaultController );
				new controller( element );
			}
			
			attr = this._getAttribute( 'class' );

			if ( attr ){
				element.origClassName = element.className;

				this.makeClass = new Function( 'model', 'return "' 
					+ attr
						.replace( /\{\{([^\?]+)\?([^:]+):([^\}]+)\}\}/g, 
							function( match, arg1, arg2, arg3 ){
								dis.classBindings.push( arg1 );
								return '"+(model.'+arg1+'?"'+arg2+'":"'+arg3+'")+"'
							}
						)
						.replace( /\{\{([^\/?&]+)\}\}/g, function( match, arg1 ){
								dis.classBindings.push( arg1 );
								return '"+model.'+arg1+'+"' 
							}
						) 
					+ '";' );
			}else{
				element.className = this.baseClass + ' ' + element.className;
			}
		},
		_initModel : function(){
			var 
				attr,
				info,
				scope,
				variable,
				model = this['bmoor.lib.Snap']._initModel.call( this );
			
			attr = this._getAttribute( 'observe' );
			if ( attr ){
				scope = attr.split('.');
				info = this._unwrapVar( model, scope, true );

				if ( info.value instanceof bmoor.observer.Map ){
					model = info.value.model;
				}else if ( typeof(info.value) == 'object' ){
					model = info.scope;
					this.variable = info.variable;
					new bmoor.observer.Map( info.value );
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
		_bind : function(){
			var dis = this;
			
			this.viewBindings = this._makeBindings();

			this.observer.bind( function( alterations ){
				if ( dis._needUpdate(alterations) ) {
					dis._prepContent( this.model, alterations );
				}

				if ( dis.makeClass && dis._needClassUpdate(alterations) ){
					dis._updateClass( this.model );
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
		_needClassUpdate : function( alterations ){
			var 
				i,
				c,
				isNeeded = false,
				bindings = this.classBindings;

			if ( alterations.binding ){
				return true;
			}

			for( i = 0, c = bindings.length; i < c && !isNeeded; i++ ){
				isNeeded = alterations[ bindings[i] ];
			}
			
			return isNeeded;
		},
		_updateClass : function( data ){
			var element = this.element;

			element.className = this.baseClass + ' ' + element.origClassName + ' ' + this.makeClass( data );
		},
		// TODO : change to _needContentUpdate
		_needUpdate : function( alterations ){
			var 
				i,
				c,
				isNeeded,
				bindings = this.viewBindings;

			if ( alterations.binding ){
				return true;
			}

			if ( bindings ){
				isNeeded = false;

				for( i = 0, c = bindings.length; i < c && !isNeeded; i++ ){
					isNeeded = alterations[ bindings[i] ];
				}
			}else{
				isNeeded = true;
			}
			
			return isNeeded;
		},
		_prepContent : function( data, alterations ){
			var dis = this;

			if ( this.variable ){
				value = data[this.variable];

				if ( typeof(data) == 'function' ){ 
					value = data[this.variable](); 
				}
			}else{
				value = data;
			}

			if ( this._makeContent( value, alterations ) ){
				bMoor.module.Bootstrap.done(function(){
					dis._finalizeContent();
				});
			}
		},
		// TODO : change to _updateContent
		_makeContent : function( data, alterations ){ 
			return true;
		},
		_finalizeContent : function(){},
		_finalize : function(){}
	}
});

}( jQuery, this ));