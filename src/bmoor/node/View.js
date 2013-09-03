;(function( $, global, undefined ){

var nodesCount = 0;

bMoor.constructor.define({
	name : 'View',
	namespace : ['bmoor','node'],
	parent : ['bmoor','node','Basic'],
	require: {
		references : { 'bMoor.module.Templator' : ['bmoor','templating','JQote'] },
	},
	node : {
		className : 'node-view'
	},
	properties : {
		defaultTemplate : null,
		_makeTemplate : function( model ){
			var template = this._getAttribute('template') || this.defaultTemplate;

			if ( template ){
				if ( template.charAt(0) == '>' ){
					this.watchTemplateVar = template.substring(1);
					template = this._unwrapVar( model, template.substring(1) );
				}

				return bMoor.module.Templator.prepare( template || this.defaultTemplate );
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
		_needUpdate : function( alterations ){
			return ( this.watchTemplateVar && alterations[this.watchTemplateVar] ) 
				|| this.__Basic._needUpdate.call( this, alterations );
		},
		_finalizeElement : function( element ){
			if ( element.nodeType != 3 ){
				bMoor.module.Bootstrap.build( element );
			}
		}
	}
});

}( jQuery, this ));