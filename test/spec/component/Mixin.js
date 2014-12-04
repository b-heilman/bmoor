describe('bmoor.component.Mixin', function(){
	var space = {},
		Mixin = bMoor.get('bmoor.component.Mixin');

	it( 'should have the target function defined', function(){
		expect( Mixin.prototype._target ).toBeDefined();
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
		var t;

		beforeEach(function(){
			bMoor.make({}, 'Mix', {
				parent: Mixin,
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

	describe( 'using Mixin', function(){
		var t;

		beforeEach(function(){
			bMoor.make({}, 'Mix', {
				parent: Mixin,
				properties : {
					eins : function(){},
					zwei : function(){}
				}
			}).then(function( O ){
				t = {};
				( new O() )._target( t );
			});
		});
		
		it( 'should copy properties over', function(){
			expect( t.eins ).toBeDefined();
		});
	});
});