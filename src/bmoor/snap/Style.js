;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Style',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	properties: {
		_setContent : function( content ){
			if ( this.element.styleSheet ){
				this.element.styleSheet.cssText = content;
			} else {
				this.element.innerHTML = '';
				this.element.appendChild(document.createTextNode( content ));
			}
		},
		baseClass  : 'snap-style'
	}
});

}( jQuery, this ));