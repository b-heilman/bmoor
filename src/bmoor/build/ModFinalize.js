(function( bMoor, compiler ){

	compiler.addModule( 1, 'bmoor.build.Finalize', ['namespace','name', 'id', 'mount', 'postMake', 
		function( namespace, name, id, mount, postMake ){

		var obj = this,
			old,
			proto = obj.prototype;

		proto.__namespace = namespace;
		proto.__name = name;
		proto.__class = id;
		proto.__mount = mount;

		if ( postMake ){
			if ( proto.__postMake ){
				old = proto.__postMake;
				proto.__postMake = function(){
					old( obj );
					
					if ( postMake ){
						postMake( obj );
					}
				};
			}else{
				proto.__postMake = postMake;
			}
		}
	}]);

}( bMoor, bMoor.compiler ));
