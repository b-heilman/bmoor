bMoor.make( 'bmoor.comm.Style', 
	['bmoor.comm.Resource', function( Resource ){
		return {
			parent : Resource,
			construct : function CommStyle(){
				Resource.apply( this, arguments );
			},
			properties : {
				apply : function styleApply( content ){
					var style = document.createElement( 'style' );

					if (style.styleSheet){
						style.styleSheet.cssText = content;
					} else {
						style.appendChild( document.createTextNode(content) );
					}
					
					document.body.appendChild( style );

					return;
				}
			}
		};
	}]
);