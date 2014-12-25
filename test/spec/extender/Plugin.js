describe('bmoor.extender.Plugin', function(){
	var space = {},
		Plugin = bMoor.get('bmoor.extender.Plugin');

	it( 'should have the _extend function defined', function(){
		expect( Plugin.prototype._extend ).toBeDefined();
	});

	it( 'should not be able to be constructed', function(){
		var t;

		try {
			new Plugin();
		} catch( e ){
			t = true;
		}

		expect( t ).toBe( true );
	});

	describe( 'extending Plugin', function(){
		var t;

		beforeEach(function(){
			t = bMoor.test.make({
				parent: Plugin,
				properties : {
					eins : function(){},
					zwei : function(){}
				}
			});

			t = new t();
		});
		
		it( 'should copy properties over', function(){
			expect( t.eins ).toBeDefined();
			expect( t._extend ).toBeDefined();
		});
	});

	describe( 'using Plugin', function(){
		var called,
			t,
			t2,
			woot1, 
			woot2;

		beforeEach(function(){
			t = bMoor.test.make({
				parent: Plugin,
				properties : {
					eins : function(){
						this.$wrapped();
						expect( this._test ).toBeDefined();
					},
					_test : 'hello'
				}
			});

			t2 = {
				eins : function(){
					called = true;
					expect( this._test ).toBeUndefined();
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