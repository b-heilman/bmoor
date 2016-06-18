describe('bmoor.build', function(){
	it( 'should copy properties over', function(){
		var t = {
				eins: function(){
					return 1;
				},
				zwei: function(){
					return 2;
				}
			},
			Def = bmoor.build( Array, { mixin: t } ),
			temp = new Def();

		expect( Def.prototype.eins ).toBeDefined();
		expect( temp instanceof Array ).toBe( true );
		expect( temp.eins ).toBeDefined();
	});
});