;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Script',
	namespace : ['bmoor','node'],
	parent : ['bmoor','node','Basic'],
	node : {
		singleClass : true,
		className : 'node-script'
	},
	properties: {
		_makeContent : function( content ){
			var script = document.createElement('script');
			script.text = content;
			
			this.element.parentNode.insertBefore( script, this.element );
			this.element.parentNode.removeChild( this.element );
			
			this.element = script;
		}
	}
});

}( jQuery, this ));