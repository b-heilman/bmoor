;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Text',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	properties: {
		_setContent : function( content ){
			this.element.innerHTML = String(content).replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
		},
		baseClass  : 'snap-text'
	}
});

}( jQuery, this ));