;(function( $, global, undefined ){

var nodesCount = 0;

bMoor.constructor.define({
	name : 'View',
	namespace : ['bmoor','node'],
	parent : ['bmoor','node','Basic'],
	node : {
		className : 'node-view'
	},
	properties : {
		_makeTemplate : function( data ){
			var template = this._getAttribute('template');

			if ( template ){
				return bMoor.module.Templator.prepare( template );
			} else return null;
		},
		_makeContent : function( data, alterations ){
			var template = this._makeTemplate( data );

			if ( template ){
				this._setContent( bMoor.module.Templator.run(template,data) );
				return true;
			}else return false;
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

				this._finalizeElement( element );

				element = next;
			}
		},
		_finalizeElement : function( element ){
			if ( element.nodeType != 3 ){
				bMoor.module.Bootstrap.build( element );
			}
		}
	}
});

}( jQuery, this ));