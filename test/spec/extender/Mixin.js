describe('bmoor.extender.Mixin', function(){
	'use strict';
	
	var Mixin;

	beforeEach(bMoor.test.injector(['bmoor.extender.Mixin', function( M ){
		Mixin = M;
	}]));

	it( 'should have the _$extend function defined', function(){
		expect( Mixin.prototype._$extend ).toBeDefined();
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

	describe( 'extending Mixin', function(){
		var t,
			t2;

		beforeEach(function(){
			t = bMoor.test.make({
					parent: Mixin,
					properties : {
						eins : function(){},
						zwei : function(){}
					}
				});

			t2 = new t();
		});
		
		it( 'should have properties', function(){
			expect( t.prototype.eins ).toBeDefined();
			expect( t.prototype._$extend ).toBeDefined();
		});

		it( 'should copy properties over', function(){
			expect( t2.eins ).toBeDefined();
			expect( t2._$extend ).toBeDefined();
		});
	});

	describe( 'using Mixin', function(){
		var t,
			t2;

		beforeEach(function(){
			t = bMoor.test.make({
					parent: Mixin,
					properties : {
						eins : function(){},
						zwei : function(){}
					}
				});

			t2 = {};
			( new t() )._$extend( t2 );
		});
		
		it( 'should copy properties over', function(){
			expect( t2.eins ).toBeDefined();
		});
	});
});