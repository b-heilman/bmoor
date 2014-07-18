describe('bmoor.flow.Timeout', function(){
	var inst = bMoor.get('bmoor.flow.Timeout'),
		mock = bMoor.get('bmock.flow.Timeout');

	it('should be defined', function(){
		expect( inst ).toBeDefined();
		expect( inst.set ).toBeDefined();
	});

	it('should be able to be mocked', function(){
		var p,
			v =  null,
			t = { 
				callback : function(){
					v = 100;
				}
			};

		p = spyOn( t, 'callback' );
		if( p.and ){
			p.and.callThrough();
		}else{
			p.andCallThrough();
		}
		
		mock.set( t.callback, 1000 );

		mock.tick( 500 );

		expect( v ).toBe( null );

		mock.tick( 1000 );

		expect( v ).toBe( 100 );
		expect( t.callback ).toHaveBeenCalled();
	});
});