describe('bmoor.component.Plugin', function(){
	var space = {},
		Plugin = bMoor.get('bmoor.component.Plugin');

	it( 'should have the target function defined', function(){
		expect( Plugin.prototype._target ).toBeDefined();
	});

	it( 'should not be able to be constructed', function(){
		var t;

		try {
			new Mixin();
		} catch( e ){
			t = true;
		}

		expect( t ).toBe( true );
	});

	describe( 'extending Plugin', function(){
		var t;

		beforeEach(function(){
			bMoor.make({}, 'Plug', {
				parent: Plugin,
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
			expect( t._target ).toBeDefined();
		});
	});

	describe( 'using Plugin', function(){
		var called,
			t;

		beforeEach(function(){
			bMoor.make({}, 'Plug', {
				parent: Plugin,
				properties : {
					eins : function(){
						this.$wrapped();
						expect( this._test ).toBeDefined();
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
				( new O() )._target( t );
			});
		});
		
		it( 'should copy properties over', function(){
			t.eins();

			expect( called ).toBe( true );
		});
	});
});