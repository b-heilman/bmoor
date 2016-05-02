describe("bmoor.build.Quark", function() {
	var Quark,
		testRoot;

	beforeEach(function(){
		Quark = bMoor.require('bmoor.build.Quark');
		testRoot = {};
	});

	it("should be defined", function(){
		expect( Quark ).toBeDefined();
	});

	describe('helper functions', function(){
		it('should define Quark.create and isQuark', function(){
			expect(Quark.create).toBeDefined();
			expect(bMoor.isQuark).toBeDefined();
		});

		it('should have Quark.create and bMoor.isQuark working', function(){
			var t = Quark.create( 'test', testRoot );

			expect( testRoot.test ).toBeDefined();
			expect( bMoor.isQuark(t) ).toBe( true );
			expect( bMoor.isQuark(testRoot.test) ).toBe( true );
		});

		it('should override bMoor.makeReady', function(){
			var t = Quark.create( 'test', testRoot ),
				hasTest,
				hasHello;

			testRoot.foo = 'bar';

			expect( bMoor.makeReady('foo',testRoot) ).toBe( 'bar' );

			try{
				bMoor.makeReady( 'test', testRoot );
				hasTest = true;
			}catch( ex ){
				hasTest = false;
			}
			expect( hasTest ).toBe( false );

			try{
				bMoor.makeReady( 'hello', testRoot );
				hasHello = true;
			}catch( ex ){
				hasHello = false;
			}
			expect( hasHello ).toBe( false );
		});

		describe('bMoor.require', function(){
			it( 'should properly operate', function(){
				var hasMissed = false,
					t = Quark.create( 'test', testRoot );

				t.$setInjection([function(){
					return 'testtest';
				}]);

				try{
					bMoor.require('hello',testRoot);
				}catch( ex ){
					hasMissed = true;
				}

				expect( bMoor.require('test',testRoot) ).toBe( 'testtest' );
				expect( hasMissed ).toBe( true );
			});

			it( 'should work with inheritance', function(){
				Quark.create( 'test', testRoot ).$setInjection(['hello',function(h){
					return 'test'+h;
				}]);

				Quark.create( 'hello', testRoot ).$setInjection([function(){
					return 'world';
				}]);

				expect( testRoot.hello ).toBeDefined();
				expect( bMoor.require('test',testRoot) ).toBe( 'testworld' );
			});
		});
	});
});