;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Snap',
	namespace : ['bmoor','lib'],
	properties : {
		getModel : function(){
			if ( this.model && this.model._bind ){
				return this.model;
			}else return null;
		},
		_element : function( element ){
			this.element = element;
		},
		_model : function(){
			this.model = this._findModel() || global;
		},
		_attributes : function( attributes ){
			this._attributes = attributes;
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
					if ( node[property] ){ return node[property]; }

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
		_findModel : function(){
			return this._findProperty( 'model' );
		},
		_pushModel : function( element, model ){
			if ( !element ){
				element = this.element;
			}

			if ( !model ){
				model = this.model;
			}
			
			element.model = model;
		}
	}
});

}( jQuery, this ));