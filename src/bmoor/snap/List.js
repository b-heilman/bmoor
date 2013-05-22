;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'List',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	construct: function( tag, template, data, node ){
		this.__parent.__construct.call( this, tag, template, data, node );
		
		this.childTag = node.hasAttribute('snap-child') ? node.getAttribute('snap-child') : this.childClass;
	},
	properties: {
		getElement : function(){
			var element = document.createElement( this.tag );
			
			for( var i = 0, c = this.data.length; i < c; i++ ){
				element.appendChild( this.makeNode(this.data[i],this.childTag) );
			}
			
			element.className = this.baseClass;
			
			return element;
		},
		baseTag    : 'ol',
		childClass : 'li',
		baseClass  : 'snap-list'
	}
});

}( jQuery, this ));