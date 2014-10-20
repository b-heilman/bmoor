describe( 'bmoor.data.Model', function(){
	var Model = bMoor.get('bmoor.data.Model');

	it( 'should be defined', function(){
		expect( Model ).toBeDefined();
	});

	describe( 'simple data merging', function(){
		it( 'should support array', function(){
			var a = [
					{
						eins : 1
					},
					{
						zwei : 2
					}
				],
				b = [
					{
						eins : 3,
						drei : 4
					}
				],
				t = bMoor.object.extend( [], Model );

			t.$override( a );
			
			expect( t.length ).toBe( 2 );
			expect( t[0].eins ).toBeDefined();

			t.$override( b );
			
			expect( t.length ).toBe( 1 );
			expect( t[0].eins ).toBe( 3 );
			expect( t[0].drei ).toBe( 4 );
		});

		it( 'should support objects', function(){
			var a = [
					{
						eins : 5
					},
					{
						zwei : 1
					}
				],
				b = [
					{
						drei : 4
					}
				],
				t = bMoor.object.extend( {}, Model );

			t.$override( a );

			expect( t.length ).not.toBeDefined();
			expect( t[0].eins ).toBeDefined();

			t.$override( b );

			expect( t.length ).not.toBeDefined();
			expect( t[0].eins ).not.toBeDefined();
			expect( t[0].drei ).toBeDefined();
		});
	});

	it( 'should always validate', function(){
		var t = bMoor.object.extend( {}, Model );

		expect( t.$validate() ).toBe( true );
	});

	it( 'should allow for data to be inflated', function(){
		var t = bMoor.object.extend( {}, Model ),
			o = {};

		expect( o ).toBe( t.$inflate(o) );
	});

	it( 'should always allow for data to be deflated', function(){
		var t = bMoor.object.extend( {
			$foo : 1,
			$bar : 2,
			hello : 'world'
		}, Model );

		expect( t.$deflate() ).toEqual( {hello:'world'} );
	});

	it( 'should always allow for simplifying objects', function(){
		var t = bMoor.object.extend( {
			$foo : 1,
			$bar : 2,
			hello : 'world'
		}, Model );

		expect( t.$simplify() ).toEqual( {hello:'world'} );
	});

	it( 'should always allow for json encoding', function(){
		var t = bMoor.object.extend( {
			$foo : 1,
			$bar : 2,
			hello : 'world'
		}, Model );

		expect( t.$toJson() ).toBe( '{"hello":"world"}' );
	});
});