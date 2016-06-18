describe('bmoor.build.plugin', function(){
	'use strict';
	
	it('should work as expected', function(){
		var t,
			t2,
			t3;

		t = {
			eins: function(){
				return this.value + this.$old();
			}
		};
		t2 = {
			eins: function(){
				return 2;
			}			
		};
		t3 = { value : 1 };

		bmoor.build.plugin( t2, t, t3 );

		expect( t2.eins() ).toBe( 3 );
	});
});