describe("bmoor.build.Compiler", function() {
	var Compiler,
		compiler,
		log,
		root;

	beforeEach(bMoor.test.injector(['bmoor.build.Compiler',function( C ){
		Compiler = C.$constructor;
	}]));
	
	describe('basically', function(){
		it("should allow the declaration of a Compiler", function(){
			expect( Compiler ).toBeDefined();
		});

		beforeEach(function(){
			log = [];

			compiler = new Compiler();
			root = compiler.newRoot();

			compiler.addModule( 0, 'test.Foo', ['foo', function( foo ){
				log.push( foo );
				this.prototype.foo = 'foo';
			}] );

			compiler.addModule( 10, 'test.Bar', ['bar', function( bar ){
				log.push( bar );
				this.prototype.bar = true;
			}] );

			compiler.addModule( -10, 'test.Foobar', ['foobar', function( foobar ){
				log.push( foobar );
				this.prototype.foobar = false;
			}] );
		});

		it("should allow plugins to be added", function(){
			expect( compiler.preProcess.length ).toBe( 2 );
			expect( compiler.postProcess.length ).toBe( 1 );
		});

		it("should run plugins in the correct order", function(){
			compiler.make( 'Aname', {
				foobar : 3,
				foo : 1,
				bar : 2
			}).$instantiate();

			expect( log ).toEqual( [2,1,3] );
			expect( root.Aname ).toBeDefined();
			expect( root.Aname.prototype.foo ).toBe( 'foo' );
			expect( root.Aname.prototype.bar ).toBe( true );
			expect( root.Aname.prototype.foobar ).toBe( false );
		});

		it("should allow previously defined objects to be mocked", function(){
			var t;

			compiler.make( 'Aname', {
				foobar : 3,
				foo : 1,
				bar : 2
			}).$instantiate();

			log = [];

			t = compiler.mock( 'Aname', {
				foobar : 7,
				foo : 5,
				bar : 6
			}).$instantiate();

			expect( log ).toEqual( [2,1,3] ); // because the original defintion doesn't inject
			expect( t.prototype.foo ).toBe( 'foo' );
			expect( t.prototype.bar ).toBe( true );
			expect( t.prototype.foobar ).toBe( false );
		});
		
		it("should run allow for injection in defintions", function(){
			var t;

			root.foobar = 13;
			root.foo = 11;
			root.bar = 12;

			t = compiler.make( 'Aname', 
				['foo', 'bar', 'foobar', function( f, b, fb ){
					return {
						foobar : fb,
						foo : f,
						bar : b
					}
				}]
			);

			t.$instantiate();

			expect( log ).toEqual( [12,11,13] );
			expect( root.Aname ).toBeDefined();
			expect( root.Aname.prototype.foo ).toBe( 'foo' );
			expect( root.Aname.prototype.bar ).toBe( true );
			expect( root.Aname.prototype.foobar ).toBe( false );
		});

		it("should clone properly", function(){
			var t,
				temp = compiler.clone(),
				r = {};

			root.foobar = 13;
			root.foo = 11;
			root.bar = 12;

			r = temp.newRoot();
			r.foobar = 23;
			r.foo = 21;
			r.bar = 22;

			t = compiler.make( 'Aname', 
				['foo', 'bar', 'foobar', function( f, b, fb ){
					return {
						foobar : fb,
						foo : f,
						bar : b
					}
				}]
			);

			t.$instantiate();

			expect( log ).toEqual( [12,11,13] );
			expect( root.Aname ).toBeDefined();
			expect( root.Aname.prototype.foo ).toBe( 'foo' );
			expect( root.Aname.prototype.bar ).toBe( true );
			expect( root.Aname.prototype.foobar ).toBe( false );

			log = [];
			t = temp.make( 'Aname', 
				['foo', 'bar', 'foobar', function( f, b, fb ){
					return {
						foobar : fb,
						foo : f,
						bar : b
					}
				}]
			);

			t.$instantiate();

			expect( log ).toEqual( [22,21,23] );
			expect( r.Aname ).toBeDefined();
			expect( r.Aname.prototype.foo ).toBe( 'foo' );
			expect( r.Aname.prototype.bar ).toBe( true );
			expect( r.Aname.prototype.foobar ).toBe( false );
		});

		it("should run allow for injection in mocks", function(){
			var t;

			root.foobar = 3;
			root.foo = 1;
			root.bar = 2;

			compiler.make( 'Aname', 
				['foo', 'bar', 'foobar', function( f, b, fb ){
					return {
						foobar : fb,
						foo : f,
						bar : b
					}
				}]
			).$instantiate();

			log = [];

			t = compiler.mock( 'Aname', {
				foobar : 27,
				bar : 26
			}).$instantiate();

			expect( log ).toEqual( [26,1,27] );
			expect( t ).toBeDefined();
			expect( t.prototype.foo ).toBe( 'foo' );
			expect( t.prototype.bar ).toBe( true );
			expect( t.prototype.foobar ).toBe( false );
		});

		it("should run allow for defining constants", function(){
			compiler.define( 'Woot', 1 ).$instantiate();
			compiler.define( 'Foo', {} ).$instantiate();
			compiler.define( 'Bar', true ).$instantiate();

			expect( root.Woot ).toBe( 1 );
			expect( root.Foo ).toBeDefined();
			expect( root.Bar ).toBe( true );
		});
	});
	
	describe('inheritance', function(){
		beforeEach(function(){
			compiler = new Compiler();
			root = compiler.newRoot();

			compiler.addModule( 90, 'bmoor.build.ModInherit', 
				['-id','-namespace','-name', '-mount','-parent',
				function( id, namespace, name, mount, parent ){
					var construct,
						proto;

					if ( parent ){
						construct = this;

						if ( bMoor.isFunction(parent) ){
							// we assume this a constructor function
							proto = parent.prototype;
						}else{
							// we want to inherit directly from this object
							proto = parent;
						}

						this.prototype = bMoor.object.mask( proto );
						this.prototype.constructor = construct;

						delete this.$generic;
					}
				}]
			);

			compiler.addModule( 10, 'bmoor.build.ModProperties', 
				['-properties', function( properties ){
					var proto = this.prototype;
					
					if ( properties ){
						bMoor.each( properties, function( prop, name ){
							proto[ name ] = prop;
						});
					}
				}]
			);
		});

		it('should be possible', function(){
			compiler.make('Test1', {
				properties : {
					eins : 'one'
				}
			}).$instantiate();

			expect( root.Test1.prototype.eins ).toBe('one');

			compiler.make('Test2', [
				'Test1',
				function( Test1 ){
					return {
						parent : Test1,
						properties : {
							zwei : 'two'
						}
					}
				}]
			).$instantiate();

			expect( root.Test2 ).toBeDefined();
			expect( root.Test2.prototype.eins ).toBeDefined();
			expect( root.Test2.prototype.zwei ).toBe('two');
		});
	});

	describe('global interaction', function(){
		it('should allow making and defining', function(){
			expect( bMoor.make ).toBeDefined();
			expect( bMoor.define ).toBeDefined();
		});

		it('should facilitate creating test objects', function(){
			expect( bMoor.test ).toBeDefined();
			expect( bMoor.test.injector ).toBeDefined();
			expect( bMoor.test.make ).toBeDefined();
			expect( bMoor.test.mock ).toBeDefined();
		});
	});

	describe('defining', function(){
		var Quark,
			compiler,
			root;

		function IncludeEcho(){}

		beforeEach(function(){
			compiler = bMoor.test.clone();
			root = compiler.newRoot();

			compiler.make('testing.Echo', [function(){
				return {
					construct: IncludeEcho,
					properties: {
						echo: function(){
							return 'hello world';
						}
					}
				}
			}]);

			Quark = bMoor.require('bmoor.build.Quark');
		});

		it( 'should set up the Quark correctly', function(){
			expect( root.testing.Echo instanceof Quark ).toBe( true );
		});

		it( 'should evaluate the Quark correctly', function(){
			root.testing.Echo.$instantiate();

			expect( root.testing.Echo instanceof Quark ).toBe( false );
			expect( root.testing.Echo === IncludeEcho ).toBe( true );
			expect( IncludeEcho.prototype.echo ).toBeDefined();
		});

		it( 'should be able to hanlde injection', function(){
			var test;

			bMoor.inject(['testing.Echo', function( E ){
				test = E;
			}], root);

			expect( test ).toBeDefined();
			expect( test === IncludeEcho ).toBe( true );
		});
	});

	describe('injection of a remade class', function(){
		var E, T;

		function IncludeEcho(){}

		function IncludeTest(){}

		bMoor.make('testing.Echo', [
			function MakeEcho(){
				return {
					construct: IncludeEcho,
					properties: {
						echo: function(){
							return 'hello world';
						}
					}
				}
			}
		]);

		bMoor.make('testing.Test', [
			'testing.Echo',
			function MakeTest( Echo ){
				return {
					construct: IncludeTest,
					properties: {
						test: function(){
							var t = new Echo();
							return t.echo();
						}
					}
				}
			}
		]);

		bMoor.make('testing.Junk', [
			function MakeJunk(){
				return {
					construct: function IncludeJunk(){},
					properties: {
						echo: function(){
							return 'junk';
						}
					}
				}
			}
		]);

		bMoor.make('testing.Top', [
			'testing.Test',
			function( Test ){
				return {
					construct: function IncludeTop(){},
					properties: {
						top: function(){
							var t = new Test();
							return t.test();
						}
					}
				}
			}
		]);

		describe('bmoor.test.injector', function(){
			it('should intially define things correctly', function(){
				var e,
					t;

				bMoor.test.injector([
					'testing.Echo', 'testing.Test',
					function( Echo, Test ){
						e = new Echo();
						t = new Test();
					}
				])();

				expect( e.echo() ).toBe('hello world');
				expect( t.test() ).toBe('hello world');
			});
			
			it('should allow a class to be replaced', function(){
				var j,
					t;

				bMoor.test.injector(
					['testing.Junk', 'testing.Test',
					function( Junk, Test ){
						j = new Junk();
						t = new Test();
					}],
					{
						'testing.Junk' : 'testing.Echo'
					}
				)();

				expect( j.echo() ).toBe('junk');
				expect( t.test() ).toBe('junk');
			});
			
			it('should go back to normal after override', function(){
				var e,
					t;

				bMoor.test.injector([
					'testing.Echo', 'testing.Test',
					function( Echo, Test ){
						e = new Echo();
						t = new Test();
					}
				])();

				expect( e.echo() ).toBe('hello world');
				expect( t.test() ).toBe('hello world');
			});
		});
		
		describe('add an extra level', function(){
			var T;

			it('should work normal at first', function(){
				var T,
					t;

				bMoor.test.injector(
					['testing.Top',
					function( Top ){
						T = Top;
					}]
				)();

				t = new T();

				expect( t.top() ).toBe('hello world');
			});
			
			it('should change after lower injection', function(){
				var T,
					t;

				bMoor.test.injector(
					['testing.Top',
					function( Top ){
						T = Top;
					}],
					{
						'testing.Junk' : 'testing.Echo'
					}
				)();

				t = new T();

				expect( t.top() ).toBe('junk');
			});
		});

		describe('overriding of defined things', function(){
			bMoor.make('testing.Hello', {
				construct: function Hello(){},
				properties: {
					hello: 'world'
				}
			});

			bMoor.make('testing.GoHome', {
				construct: function GoHome(){},
				properties: {
					hello: 'go home'
				}
			});

			bMoor.define('testing.Yolo', [
				'testing.Hello',
				function( SayWhat ){
					return function(){
						var t = new SayWhat();
						return t.hello;
					}
				}
			]);

			it('should work the first time', function(){
				var Yolo;

				bMoor.test.injector(
					['testing.Yolo',
					function( Y ){
						Yolo = Y;
					}]
				)();

				expect( Yolo() ).toBe( 'world' );
			});

			it('should allow overriding', function(){
				var Yolo;

				bMoor.test.injector(
					['testing.Yolo',
					function( Y ){
						Yolo = Y;
					}],
					{
						'testing.GoHome': 'testing.Hello'
					}
				)();

				expect( Yolo() ).toBe( 'go home' );
			});
		});
	});
});