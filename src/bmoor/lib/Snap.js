;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Snap',
	namespace : ['bmoor','lib'],
	require : {
		classes : [ 
			['bmoor','observer','Map'],
			['bmoor','observer','Collection']
		]
	},
	properties : {
		getModel : function(){
			if ( this.observer ){
				return this.observer.model;
			}else return null;
		},
		_element : function( element ){
			this.element = element;
		},
		_model : function(){
			var observer = this._findObserver();

			return  observer ? observer.model : global;
		},
		_observe : function( model ){
			var observer = null;

			if ( model ){
				if ( model._ ){
					observer = model._;
				}else{
					if ( model.length ){
						observer = new bmoor.observer.Collection( model );
					}else{
						observer = new bmoor.observer.Map( model );
					}
				}
			}

			return observer;
		},
		_attributes : function( attributes ){
			this._attributes = attributes;
		},
		_unwrapVar : function( context, variable, smart ){
			var 
				scope,
				value = context,
				variable,
				test = typeof(variable) == 'string' ? variable.split('.') : variable,
				i,
				c;

			if ( smart ){
				for( i = 0, c = test.length; i < c; i++ ){
					if ( value[test[i]] ){
						scope = value;
						variable = test[i];
						value = value[ variable ];
					}else return undefined;
				}

				return {
					scope : scope,
					value : value,
					variable : variable
				};
			}else{
				for( i = 0, c = test.length; i < c; i++ ){
					if ( value[test[i]] ){
						value = value[ test[i] ];
					}else return undefined;
				}

				return scope;
			}
		},
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
		_findProperty : function( property ){
			var node = this.element;

			if ( node ){
				if ( !node.hasAttribute ){
					node = node[ 0 ];
				}

				while( node.tagName != 'HTML' ){
					if ( node[property] ){ 
						return node[property]; 
					}
					node = node.parentNode;
				}
			}

			return null;
		},
		_findRoot : function(){
			return this._findProperty( 'root' );
		},
		_setRoot : function( controller ){
			if ( !controller ){
				controller = this.root;
			}
			
			this.element.root = controller;
		},
		_findObserver : function(){
			return this._findProperty( 'observer' );
		},
		_pushObserver : function( element, observer ){
			if ( !element ){
				element = this.element;
			}

			if ( !observer ){
				observer = this.observer;
			}
			
			element.observer = observer;
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