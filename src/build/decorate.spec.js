describe('bmoor.build.decorate', function(){
	it( 'should copy properties over', function(){
		var called,
			t,
			t2;

		t = {
			eins : function(){
				this.$old();
				return this._test;
			},
			zwei : function(){},
			_test : 'hello'
		};

		t2 = {
			eins : function(){
				called = true;
			}
		};

		bmoor.build.decorate( t2, t );
		
		expect( t2.eins() ).toBeUndefined();
		expect( called ).toBe( true );
		expect( t2.zwei ).toBeDefined();
	});
});