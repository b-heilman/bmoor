(function(){

	bMoor.define({
		name : 'bmoor.comm.Style',
		parent : 'bmoor.comm.Resource',
		properties : {
			apply : function styleApply( content ){
				var style = document.createElement( 'style' );

				if (style.styleSheet){
					style.styleSheet.cssText = content;
				} else {
					style.appendChild( document.createTextNode(content) );
				}
				
				document.body.appendChild( style );
			}
		}
	});
}());