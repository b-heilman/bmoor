(function(){

	bMoor.define( 'bmoor.comm.Script', {
		parent : 'bmoor.comm.Resource',
		properties : {
			apply : function scriptApply( content ){
				var script = document.createElement( 'script' );

				script.text = content;
				document.body.appendChild( script );

				return;
			}
		}
	});

}());