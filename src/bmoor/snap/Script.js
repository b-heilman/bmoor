;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Script',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	node : {
		singleClass : true,
		className : 'snap-script'
	},
	properties: {
		_setContent : function( content ){
			var script = document.createElement('script');
			script.text = content;
			
			this.element.parentNode.insertBefore( script, this.element );
			this.element.parentNode.removeChild( this.element );
			
			this.element = script;
		}
	}
});

}( jQuery, this ));