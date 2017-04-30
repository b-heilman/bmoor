describe('bmoor.build.mixin', function(){
	it( 'should copy properties over', function(){
		var t,
			t2;

		t = {
			eins: function(){
				return 1;
			},
			zwei: function(){
				return 2;
			}
		};

		t2 = {
			zwei: function(){
				return 'zwei';
			},
			drei: function(){
				return 3;
			}
		};

		bmoor.build.mixin( t2, t );

		expect( t2.eins() ).toBe( 1 );
		expect( t2.zwei() ).toBe( 2 );
		expect( t2.drei() ).toBe( 3 );
	});
});