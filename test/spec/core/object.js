describe("Testing object functions", function() {
	// instantiate
	it('should allow for the instantiation of objects from classes', function(){
		var wasCalled = false;

		function Foo( dude, hey ){
			wasCalled = true;
			this.dude = dude;
			this.hey = hey;
		}

		expect( bMoor.object.instantiate(Foo,['derp','woot']).dude ).toBe( 'derp' );
		expect( wasCalled ).toBe( true );
	});
	
	// mask
	it('should allow for the creation of object from a base object', function(){
		var t,
			v;

		function Foo( derp ){
			this.woot = derp;
		}

		Foo.prototype.bar = 'yay';

		t = new Foo();

		v = bMoor.object.mask( t );
	});


	// extend
	it('should allow for objects to be extended by other objects', function(){
		var t = {
			'foo'  : 1,
			'bar'  : 2 ,
			'woot' : 3
		};

		bMoor.object.extend( t, {
			'yay' : 'sup',
			'foo' : 'foo2'
		},{
			'woot' : '3!'
		});

		expect( t.foo ).toBe( 'foo2' );
		expect( t.woot ).toBe( '3!' );
	});
	// copy
	// TODO : yeah, need to do this one

	// equals
	// TODO : yeah, need to do this one

	// map
	it('should allow for the mapping of variables onto an object', function(){
		var o = {},
			t = bMoor.object.explode({
				'eins': 1, 
				'zwei': 2,
				'drei': 3,
				'foo.bar': 'woot',
				'help.me': o
			},{
				hello:'world'
			});

		expect( t.eins ).toBe( 1 );
		expect( t.foo.bar ).toBe( 'woot' );
		expect( t.hello ).toBe( 'world' );
		expect( t.help.me ).toBe( o );
	});

	it('should allow for a new variable to be created from a map', function(){
		var o = {},
			t = bMoor.object.explode({
				'eins': 1, 
				'foo.bar': 'woot',
				'hello.world': o
			});

		expect( t.eins, 1 );
		expect( t.foo.bar, 'woot' );
		expect( t.hello.world ).toBe( o );
	});

	describe('override', function(){
		it( 'should prune old properties', function(){
			var t = {
					eins : 1,
					zwei : {
						foo : 1,
						bar : 2
					}
				}

			bMoor.object.override( t, {
				drei : 3
			});

			expect( t.eins ).toBeUndefined();
			expect( t.zwei ).toBeUndefined();
			expect( t.drei ).toBe( 3 );
		});

		it( 'should handle shallow object copy', function(){
			var t = {
					eins : 1,
					zwei : {
						foo : 1,
						bar : 2
					}
				},
				o = {
					drei : {
						hello: 'world'
					}
				};

			bMoor.object.override( t, o );

			o.drei.hello = 'woot';

			expect( t.drei.hello ).toBe( 'woot' );
		});

		it( 'should handle deep object copy', function(){
			var t = {
					eins : 1,
					zwei : {
						foo : 1,
						bar : 2
					}
				},
				o = {
					drei : {
						hello: 'world'
					}
				};

			bMoor.object.override( t, o, true );

			o.drei.hello = 'woot';

			expect( t.drei.hello ).toBe( 'world' );
		});
	});

	it( 'should allow for data to be merged', function(){
		var t = {
			eins : 1,
			zwei : {
				foo : 1,
				bar : 2
			},
			drei : 3
		}

		bMoor.object.merge( t, {
			eins : 2,
			zwei : {
				foo : 2
			},
			fier : 4
		});

		expect( t.eins ).toBe( 2 );
		expect( t.zwei ).toBeDefined();
		expect( t.zwei.foo ).toBe( 2 );
		expect( t.drei ).toBe( 3 );
		expect( t.fier ).toBe( 4 );
	});
});