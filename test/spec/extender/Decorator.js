describe('bmoor.extender.Decorator', function(){
	var Decorator;

	beforeEach(bMoor.test.injector(['bmoor.extender.Decorator', function( D ){
		Decorator = D;
	}]));

	it( 'should have the _extend function defined', function(){
		expect( Decorator.prototype._extend ).toBeDefined();
	});

	it( 'should not be able to be constructed', function(){
		var t;

		try {
			new Decorator();
		} catch( e ){
			t = true;
		}

		expect( t ).toBe( true );
	});

	describe( 'extending Decorator', function(){
		var t,
			t2;

		beforeEach(function(){
			t = bMoor.test.make({
					parent: Decorator,
					properties : {
						eins : function(){},
						zwei : function(){}
					}
				});

			t2 = new t();
		});
		
		it( 'should have properties', function(){
			expect( t.prototype.eins ).toBeDefined();
			expect( t.prototype._extend ).toBeDefined();
		});

		it( 'should copy properties over', function(){
			expect( t2.eins ).toBeDefined();
			expect( t2._extend ).toBeDefined();
		});
	});

	describe( 'using Decorator', function(){
		var called,
			t,
			t2;

		beforeEach(function(){
			t = bMoor.test.make({
					parent: Decorator,
					properties : {
						eins : function(){
							this.$wrapped();
							expect( this._test ).toBeUndefined();
						},
						zwei : function(){},
						_test : 'hello'
					}
				});

			t2 = {
				eins : function(){
					called = true;
				}
			};

			( new t() )._extend( t2 );
		});
		
		it( 'should copy properties over', function(){
			t2.eins();

			expect( called ).toBe( true );
		});
	});
});