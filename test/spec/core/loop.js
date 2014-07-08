describe('Testing error handling functionality', function(){
	//loop
	it('should allow looping through array like elements with bMoor.loop', function(){
		var t = [0,1,2,3];

		bMoor.loop(t, function( v, i ){
			expect( v ).toBe( i );

			this[i] = true;
		});

		expect( t ).toEqual( [true,true,true,true] );
	});

	it('should allow looping through array like elements with bMoor.loop, while allowing alternate scope', function(){
		var t = [0,1,2,3],
			t2 = [];

		bMoor.loop(t, function( v, i ){
			expect( v ).toBe( i );

			this[i] = true;
		}, t2);

		expect( t2 ).toEqual( [true,true,true,true] );
	});

	//each
	it('should allow looping through hash\'s own properites with bMoor.each', function(){
		var t = { 
				eins : true
			};

		bMoor.each( t, function(v,k){
			expect( k ).toBe( 'eins' );
			expect( v ).toBe( true );
		});
	});

	it('should allow looping through hash\'s own properites with bMoor.each, while allowing alternate scope', function(){
		var t = { 
				eins : true
			},
			t2 = {};

		bMoor.each( t, function(v,k){
			expect( k ).toBe( 'eins' );
			expect( v ).toBe( true );

			t2[ k ] = v;
		});

		expect( t2 ).toEqual( t );
	});

	//iterate
	it('should allow looping through object\'s own properites, ignoring special vars with bMoor.iterate', function(){
		function f(){
			this.eins = true;
			this._hidden = true;
		}

		f.prototype.foobar = function(){};

		var t = new f(),
			t2 = {};

		bMoor.iterate( t, function(v,k){
			expect( k ).toBe( 'eins' );
			expect( v ).toBe( true );

			t2[ k ] = v;
		});

		expect( t2 ).toEqual({
			eins : true
		});
	});

	//forEach
	// TODO
});

