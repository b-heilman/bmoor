bMoor.inject([
	'bmoor.defer.Group', 'bmoor.defer.Basic',
	function( Group, Basic ){
		'use strict';

		function Quark( path, root ){
			var name = path.join('.');

			this.getPath = function(){
				return path;
			};
			this.getRoot = function(){
				return root;
			};
			this.getName = function(){
				return name;
			};

			if ( path.length ){
				bMoor.set( path, this, root );
			}
		}

		Quark.create = function( path, root ){
			var t;

			if ( path !== '' ){
				path = bMoor.parseNS(path);
				t = bMoor.get( path, root );
			}else{
				path = [];
			}

			// if it is not already a Quark, redefine it
			if ( !(t instanceof Quark) ){
				t = new Quark( path, root );
			}

			return t;
		};

		Quark.prototype.clone = function( path, root ){
			var t = Quark.create( path, root );

			if ( this._injection ){
				t.$setInjection( this._injection );
			}

			return t;
		};

		Quark.prototype.$instantiate = function(){
			// you are asked to instantiate but have no injection defined, so you haven't been defined...
			var t,
				path = this.getPath(),
				root = this.getRoot();

			if ( this._injection ){
				t = bMoor.invoke( this._injection, root );

				if ( this.$$lock ){
					t.$$lock = this.$$lock; // transfer any locks over
				}

				if ( path.length ){
					bMoor.set( path, t, root );
				}

				if ( this._waiting ){
					this._waiting.resolve( t );
				}

				return t;
			}else{
				if ( !this._waiting ){
					this._waiting = new Basic();
				}

				return this._waiting.promise;
			}
		};

		Quark.prototype.$reqs = function( func, root ){
			var i, c,
				t,
				reqs = this._requirements,
				isValid = true;
			
			for( i = 0, c = reqs.length; i < c && isValid; i++ ){
				t = bMoor.exists( reqs[i], root );
				isValid = func.call( undefined, t, reqs[i] );
			}

			return isValid;
		};

		Quark.prototype.$setInjection = function( inj ){
			var root = this.getRoot(),
				name = this.getName(),
				missing = [];

			this._injection = inj.slice(0).filter(function(o){
				// when a mock takes over its target, it can inject the target into itself.  This blocks that.
				return o !== name;
			});

			this._requirements = bMoor.inject.getInjections( this._injection );
			this.$reqs(function( t, path ){
				if ( t === undefined ){
					Quark.create( path, root );
					missing.push( path );
				} else if ( bMoor.isQuark(t) ){
					missing.push( path );
				}
			}, root);
			this._requirements = missing;
			
			if ( this._waiting ){
				this.$instantiate();
			}

			return this;
		};

		Quark.prototype.$warn = function(){
			return 'attempting to use quark, which is located at '+this.getPath().join('.');
		};

		Quark.prototype.getRequirements = function(){
			return this._requirements;
		};

		// sync version, can throw exception
		Quark.prototype.define = function(){
			var isValid = this.$reqs(function( t ){
				return (bMoor.isQuark(t) && t.define()) || !bMoor.isReady(t);
			}, this.getRoot());

			if ( isValid ){
				return this.$instantiate();
			}else{
				throw new Error( this.$warn() );
			}
		};

		// a sync version
		Quark.prototype.load = function(){
			var dis = this,
				waitFor = new Group();

			this.$reqs(function( t ){
				if ( bMoor.isQuark(t) ){
					waitFor.add( t.load() );
				}
			}, this.getRoot());

			waitFor.run();

			return waitFor.promise.then(function(){
				return dis.$instantiate();
			});
		};

		bMoor.set( 'bmoor.build.Quark', Quark );

		bMoor.plugin('ensure', function( path, root ){
			var t,
				obj = bMoor.exists( path, root );
		
			if ( obj ){
				if ( obj instanceof Quark ){
					t = obj.$instantiate();
				}else{
					t = obj;
				}
			}else{
				t = ( new Quark(path,root) ).$instantiate();
			}

			return bMoor.dwrap( t );
		});

		bMoor.plugin('require', function( path, root ){
			var t = bMoor.exists( path, root );

			if ( t instanceof Quark ){
				return t.define();
			} else if ( bMoor.isDefined(t) ){
				return t;
			} else {
				throw new Error('could not require: '+path );
			}
		});

		bMoor.plugin('makeReady', function( path, root ){
			var obj = bMoor.exists( path, root );

			if ( bMoor.isQuark(obj) ){
				return obj.define();
			}else if (bMoor.isDefined(obj) ){
				return obj;
			}else{
				throw new Error('could not make '+path+' ready');
			}
		});

		bMoor.plugin('isQuark', function( test ){
			return test instanceof Quark;
		});
	}
]);
