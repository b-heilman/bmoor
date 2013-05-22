;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Node',
	namespace : ['bmoor','snap'],
	require : [ ['bmoor', 'templating', 'Builder'] ],
	construct: function( tag, template, data, node ){
		this.tag = tag ? tag : this.baseTag;
		this.data = data;
		this.prepared = bMoor.template.getDefaultTemplator().prepare(
			bMoor.loader.loadTemplate( template, null )
		);
	},
	properties: {
		getElement : function(){
			var element = this.makeNode( this.data, this.tag );
			
			element.className = this.baseClass;
			
			return element;
		},
		makeNode : function( data, tag ){
			var 
				template = bMoor.template.getDefaultTemplator().run( this.prepared, data ),
				element = document.createElement( tag );
			
			element.innerHTML = template;
			
			bmoor.templating.Builder.setContext( element, data );
			
			return element;
		},
		baseTag   : 'div',
		baseClass : 'snap-node'
	}
});

}( jQuery, this ));