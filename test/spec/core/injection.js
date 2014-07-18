describe("Testing injection functionality", function() {
	var Promise = bMoor.get('bmoor.defer.Promise');

	// makeQuark
	it('should allow for the creation of quarks', function(){
		var root = {};

		bMoor.makeQuark( 'foo.bar', root );

		expect( root.foo.bar ).toBeDefined();
		expect( root.foo.bar.$promise ).toBeDefined();
		expect( root.foo.bar.$ready ).toBeDefined();
	});

	// ensure
	it('ensure should put a quark in place of a missing object', function(){
		var root = {};

		bMoor.ensure( 'foo.bar', root );

		expect( root.foo.bar ).toBeDefined();
		expect( root.foo.bar.$promise ).toBeDefined();
		expect( root.foo.bar.$ready ).toBeDefined();
	});
	it('ensure should always return a promise', function(){
		var root = {
			foo : {
				bar : 1
			}
		};

		expect(
			bMoor.ensure('foo.bar',root) instanceof Promise
		).toBe( true );
	});

	// request
	it('should handle a single request and return a promise', function(){
		var root = {},
			req = bMoor.request( 'foo.bar', true, root ),
			t = {},
			res;

		root.foo.bar.$ready( t );

		req.then(function( v ){
			res = v;
		});

		expect( res ).toBe( t );
	});
	it('should handle a request array and return a promise', function(){
		var root = {},
			req = bMoor.request( ['foo','bar'], true, root ),
			t1 = {},
			t2 = {}.
			res1,
			res2;

		root.foo.$ready( t1 );
		root.bar.$ready( t2 );

		req.then(function( args ){
			res1 = args[0];
			res2 = args[1];
		});

		expect( res1 ).toBe( t1 );
		expect( res2 ).toBe( t2 );
	});

	// translate
	it("should allow for an array of variables to be translated", function(){
		var root = {},
			res;

		bMoor.register( 'foo', 1, root );
		bMoor.set( 'bar', 2, root );

		res = bMoor.translate( ['@foo','@bar','-foo','-bar','+woot','dupe'], root );

		expect( res[0] ).toBe( 1 );
		expect( res[1] ).not.toBeDefined();
		expect( res[2] ).not.toBeDefined();
		expect( res[3] ).toBe( 2 );
		expect( res[4] instanceof Promise ).toBe( true );
		expect( res[5] instanceof Promise ).toBe( true );
	});

	// inject
	it("should facilitate the injection of variables into a function", function(){
		var uno,
			tres,
			root = {
				eins : 1, 
				zwei : {
					drei : 3
				}
			};

		bMoor.inject(['eins','zwei.drei', function(foo, bar){
			uno = foo;
			tres = bar;
		}], root);

		expect( uno ).toBe( 1 );
		expect( tres ).toBe( 3 );
	});
});