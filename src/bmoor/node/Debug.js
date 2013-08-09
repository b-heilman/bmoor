;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Debug',
	namespace : ['bmoor','node'],
	parent : ['bmoor','node','Basic'],
	node : {
		singleClass : true,
		className : 'node-debug'
	},
	properties: {
		_makeContent : function( data ){
			this.element.innerHTML = JSON.stringify( data._simplify ? data._simplify() : data );
		}
	}
});

}( jQuery, this ));