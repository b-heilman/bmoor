(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 1, 'bmoor.build.ModFinalize', 
			['-onMake', '-parent', function( onMake, parent ){

			var obj = this,
				proto = obj.prototype;

			if ( parent ){
				return bMoor.request( parent ).then(function( p ){
					if ( onMake ){
						obj.$onMake = onMake;

						if ( p.$parentMakes ){
							obj.$parentMakes = bMoor.create( p.$parentMakes );
						}else{
							obj.$parentMakes = {};
						}

						obj.$parentMakes[ p.prototype.__class ] = p.$onMake;
					}else{
						obj.$onMake = p.$onMake;
					}
				}); // TODO : make this a request?
			}else if ( onMake ){
				obj.$onMake = onMake;
			}
		}]);
	});

}());
