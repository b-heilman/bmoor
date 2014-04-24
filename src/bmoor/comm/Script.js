bMoor.make( 'bmoor.comm.Script', 
	['bmoor.comm.Resource',function( Resource ){
		return {
			parent : Resource,
			construct : function CommScript(){
				Resource.apply( this, arguments );
			},
			properties : {
				apply : function scriptApply( content ){
					var script = document.createElement( 'script' );

					script.text = content;
					document.body.appendChild( script );

					return;
				}
			}
		};
	}]
);