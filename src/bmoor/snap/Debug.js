;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Debug',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	node : {
		singleClass : true,
		className : 'snap-debug'
	},
	properties: {
		_setContent : function( data ){
			this.element.innerHTML = JSON.stringify( data._simplify ? data._simplify() : data );
		}
	}
});

}( jQuery, this ));