;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Style',
	namespace : ['bmoor','node'],
	parent : ['bmoor','node','Basic'],
	node : {
		singleClass : true,
		className : 'node-style'
	},
	properties: {
		_makeContent : function( content ){
			if ( this.element.styleSheet ){
				this.element.styleSheet.cssText = content;
			} else {
				this.element.innerHTML = '';
				this.element.appendChild( document.createTextNode(content) );
			}
		}
	}
});

}( jQuery, this ));