describe('bmoor.extender.Decorator', function(){
	var space = {},
		Decorator = bMoor.get('bmoor.extender.Decorator');

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
		var t;

		beforeEach(function(){
			bMoor.make({}, 'Dec', {
				parent: Decorator,
				properties : {
					eins : function(){},
					zwei : function(){}
				}
			}).then(function( O ){
				t = new O();
			});
		});
		
		it( 'should copy properties over', function(){
			expect( t.eins ).toBeDefined();
			expect( t._extend ).toBeDefined();
		});
	});

	describe( 'using Decorator', function(){
		var called,
			t;

		beforeEach(function(){
			bMoor.make({}, 'Dec', {
				parent: Decorator,
				properties : {
					eins : function(){
						this.$wrapped();
						expect( this._test ).toBeUndefined();
					},
					zwei : function(){},
					_test : 'hello'
				}
			}).then(function( O ){
				t = {
					eins : function(){
						called = true;
					}
				};
				( new O() )._extend( t );
			});
		});
		
		it( 'should copy properties over', function(){
			t.eins();

			expect( called ).toBe( true );
		});
	});
});