(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 1, 'bmoor.build.ModFinalize', 
			['namespace','name', 'mount', 'postMake', function( namespace, name, mount, postMake ){

			var obj = this,
				old,
				proto = obj.prototype;

			proto.__namespace = namespace;
			proto.__name = name;
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
	});

}());
