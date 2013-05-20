;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Node',
	namespace : ['bmoor','snap'],
	require: [
	    ['bmoor','templating','Snap']
	],
	construct: function( tag, template, data ){
		this.tag = tag;
		this.data = data;
		this.prepared = bmoor.templating.Snap.prepare(
			bMoor.loader.loadTemplate( template, null )
		);
	},
	properties: {
		getElement : function(){
			var 
				element = bmoor.templating.Snap.run( this.prepared, this.data, this.tag ),
				out;
			
			if ( typeof(element) == 'string' ){
				var t = document.createElement( this.tag );
				t.innerHTML = element;
				
				out = t;
			}else{
				out = element;
			}
			
			out.className = this.baseClass+' '+out.className;
			
			return out;
		},
		baseClass : 'snap-node'
	}
});

}( jQuery, this ));