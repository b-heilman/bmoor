bMoor.define( 'bmoor.comm.Script', 
	['bmoor.comm.Resource',function( Resource ){
		return {
			parent : Resource,
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