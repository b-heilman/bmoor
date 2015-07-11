describe('bmoor.extender.Plugin', function(){
	'use strict';
	
	var Plugin; // Plugin maintains its own context

	beforeEach(bMoor.test.injector(['bmoor.extender.Plugin', function(P){
		Plugin = P;
	}]));

	it( 'should have the _$extend function defined', function(){
		expect( Plugin.prototype._$extend ).toBeDefined();
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
			expect( t._$extend ).toBeDefined();
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
					eins: function(){
						this.$old();
						expect( this._test ).toBe( 'hello' );
					},
					_test: 'hello'
				}
			});

			t2 = {
				eins: function(){
					called = true;
					expect( this._test ).toBe( 'foo' );
				},
				_test: 'foo'
			};
			
			( new t() )._$extend( t2 );
		});
		
		it( 'should copy properties over', function(){
			t2.eins();

			expect( called ).toBe( true );
		});
	});
});