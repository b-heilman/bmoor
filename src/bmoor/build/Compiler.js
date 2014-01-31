(function( bMoor, undefined ){

	var instance,
		Defer = bMoor.ensure('bmoor.defer.Basic'),
		Compiler = bMoor.ensure('bmoor.build.Compiler');

	Compiler.prototype._construct = function(){
		this.stack = [];
		this.clean = true;
	};

	Compiler.prototype.addModule = function( rank, namePath, injection ){
		this.clean = false;

		if ( arguments.length < 3 ){
			injection = namePath;
		}else{
			bMoor.install( namePath, injection[injection.length-1] );
		}

		this.stack.push({
			rank : parseInt(rank,10),
			module : injection
		});
	};

	Compiler.prototype.make = function( settings ){
		var dis = this,
			stillDoing = true,
			$d = new Defer(),
			promise = $d.promise,
			obj,
			i, c,
			maker;
		
		if ( bMoor.isString(settings.name) ){
			settings.id = settings.name;
			settings.namespace = bMoor.parseNS( settings.name );
		}else if ( bMoor.isArray(settings.name) ){
			settings.namespace = settings.name;
			settings.id = settings.name.join('.');
		}else{
			throw 'you need to define a name and needs to be either a string or an array';
		}

		obj = bMoor.ensure( settings.id );
		settings.name = settings.namespace.pop();
		settings.mount = bMoor.get( settings.namespace );

		if ( !this.clean ){
			this.stack.sort(function( a, b ){
				return b.rank - a.rank;
			});
			this.clean = true;
		}

		$d.resolve( obj );

		bMoor.loop( this.stack, function( maker ){
			promise = promise.then(function(){ 
				bMoor.inject( maker.module, settings, obj ); 
			});
		});

		promise.then(function(){
			if ( obj.prototype.__postMake ){
				obj.prototype.__postMake( obj );
			}

			if ( obj.$defer ){
				obj.$defer.resolve( obj );
				obj.$loaded = true; // what do I use this for?  Thinking vestigial
			}

			return obj;
		});

		return obj;
	};

	instance = new Compiler();

	Compiler.$instance = instance;
	Compiler.$defer.resolve( Compiler );

	bMoor.install( 'bmoor.build.Compiler', Compiler );
	bMoor.install( 'bmoor.build.$compiler', instance );
	bMoor.plugin( 'define', function( settings ){
		return instance.make( settings );
	});

}( bMoor ));
