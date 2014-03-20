bMoor.inject(
	['bmoor.defer.Basic','bmoor.build.Compiler','@global', 
	function( Defer, Compiler, global ){
		var defer = Compiler.$.defer,
			instance;

		function make( obj, name, definition ){
			var i, c,
				dis = this,
				stillDoing = true,
				$d = new Defer(),
				promise = $d.promise,
				defer = obj.$.defer,
				maker;

			obj.$.defer = null;

			if ( bMoor.isString(name) ){
				definition.id = name;
				definition.namespace = bMoor.parseNS( name );
			}else if ( bMoor.isArray(name) ){
				definition.namespace = name;
				definition.id = name.join('.');
			}else{
				throw JSON.stringify(name) + ' > ' + JSON.stringify(definition) + ' > ' +
					'message : you need to define a name and needs to be either a string or an array';
			}

			definition.name = definition.namespace.pop();
			definition.mount = bMoor.get( definition.namespace );

			if ( !this.clean ){
				this.stack.sort(function( a, b ){
					return b.rank - a.rank;
				});
				this.clean = true;
			}

			$d.resolve();

			bMoor.loop( this.stack, function( maker ){
				promise = promise.then(function(){
					return bMoor.inject( maker.module, definition, obj ); 
				});
			});

			promise.then(function(){
				if ( obj.$onMake ){
					obj.$onMake( definition );
				}

				if ( defer ){
					defer.resolve( obj );
				}
			});
		}

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

		Compiler.prototype.make = function( name, definition ){
			var dis = this,
				obj = bMoor.ensure( name );

			if ( arguments.length !== 2 ) {
				throw 'you need to define a name and a definition';
			}
			
			if ( bMoor.isInjectable(definition) ){
				if ( bMoor.require ){
					bMoor.require.inject( definition ).then(function( def ){
						make.call( dis, obj, name, def );
					});
				}else{
					bMoor.inject( definition, true ).then(function( def ){
						make.call( dis, obj, name, def );
					});
				}
			}else{
				make.call( this, obj, name, definition );
			}

			return obj.$.promise;
		};

		instance = new Compiler();

		Compiler.$instance = instance;
		bMoor.install( 'bmoor.build.$compiler', instance );

		bMoor.plugin( 'define', function( name, definition ){
			return instance.make( name, definition );
		});

		Compiler.$.defer = null;
		defer.resolve( Compiler );
	}
]);
