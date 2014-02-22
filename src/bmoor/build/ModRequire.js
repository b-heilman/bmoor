(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 100, 'bmoor.build.ModRequire', ['-require', function( require ){
			var group = new bmoor.defer.Group(),
				classes,
				aliases;

			if ( require ){
				if ( bMoor.isString(require) ){
					classes = [ require ];
				}else if ( bMoor.isArrayLike(require) ){
					classes = require;
				}else{
					classes = require.classes || [];
					aliases = require.aliases || {};
				}
				
				bMoor.loop( classes, function( namespace ){
					group.add( bmoor.comm.$require.one(namespace) );
				});

				bMoor.iterate( aliases, function( namespace, alias ){
					group.add( bmoor.comm.$require.one(alias, true, namespace) );
				});
			}

			if ( group.run ){
				group.run();
			}

			return group.promise;
		}]);
	});

}());
