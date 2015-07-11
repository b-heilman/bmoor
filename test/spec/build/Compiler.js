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
			root = {};

			compiler = new Compiler();
			compiler.setRoot( root );

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
			}).$getDefinition();

			expect( log ).toEqual( [2,1,3] );
			expect( root.Aname ).toBeDefined();
			expect( root.Aname.prototype.foo ).toBe( 'foo' );
			expect( root.Aname.prototype.bar ).toBe( true );
			expect( root.Aname.prototype.foobar ).toBe( false );
		});

		it("should allow previously defined objects to be mocked", function(){
			compiler.make( 'Aname', {
				foobar : 3,
				foo : 1,
				bar : 2
			}).$getDefinition();

			log = [];

			compiler.mock( 'Aname', {
				foobar : 7,
				foo : 5,
				bar : 6
			}).then(function( o ){
				t = o;
			});	

			expect( log ).toEqual( [2,1,3] ); // because the original defintion doesn't inject
			expect( t ).toBeDefined();
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

			t.$getDefinition();

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

			temp.setRoot(r);
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

			t.$getDefinition();

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

			t.$getDefinition();

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
			).$getDefinition();

			log = [];

			compiler.mock( 'Aname', {
				foobar : 27,
				bar : 26
			}).then(function( o ){
				t = o;
			});

			expect( log ).toEqual( [26,1,27] );
			expect( t ).toBeDefined();
			expect( t.prototype.foo ).toBe( 'foo' );
			expect( t.prototype.bar ).toBe( true );
			expect( t.prototype.foobar ).toBe( false );
		});

		it("should run allow for defining constants", function(){
			compiler.define( 'Woot', 1 );
			compiler.define( 'Foo', {} );
			compiler.define( 'Bar', true );

			expect( root.Woot ).toBe( 1 );
			expect( root.Foo ).toBeDefined();
			expect( root.Bar ).toBe( true );
		});
	});
	
	describe('inheritance', function(){
		beforeEach(function(){
			root = {};
			compiler = new Compiler();

			compiler.setRoot( root );

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
			}).$getDefinition();

			expect( root.Test1.prototype.eins ).toBe('one');
			expect( root.Test1.$ready ).toBeUndefined();

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
			).$getDefinition();

			expect( root.Test2 ).toBeDefined();
			expect( root.Test2.prototype.eins ).toBeDefined();
			expect( root.Test2.prototype.zwei ).toBe('two');
			expect( root.Test2.$ready ).toBeUndefined();
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

	describe('bMoor.require', function(){
		var Timeout;

		beforeEach(bMoor.test.injector(
			['bmoor.flow.Timeout',
			function( T ){
				Timeout = T;
			}]
		));

		it('should allow requiring', function(){
			expect( bMoor.require ).toBeDefined();
		});

		it('should pass back a required object', function(){
			var t = bMoor.require('bmoor.flow.Timeout');

			expect( t ).toBe( Timeout );
		});

		it('should fail if it can not find required object', function(){
			var t;

			try{
				bMoor.require('bmoor.flow.Timeout2');
			}catch( ex ){
				t = true;
			}

			expect( t ).toBe( true );
		});
	});
});