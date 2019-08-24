describe("Testing object setting/getting", function() {
	it('should have get working', function(){
		var t = {
				eins : 1,
				zwei: {
					drei: 3
				}
			};

		expect( bmoor.get(t,'eins') ).toBe(1);
		expect( bmoor.get(t,'zwei.drei') ).toBe(3);
	});

	it('should have get working with empty strings', function(){
		var t = {
				eins : 1,
				zwei: {
					drei: 3
				}
			};

		expect( bmoor.get(t,'') ).toBe(t);
	});

	it('should have makeGetter working', function(){
		var t = {
				eins : 1,
				zwei: {
					drei: 3
				}
			},
			f1 = bmoor.makeGetter('eins'),
			f2 = bmoor.makeGetter('zwei.drei');

		expect( f1(t) ).toBe(1);
		expect( f2(t) ).toBe(3);
	});

	it('should have makeGetter working with empty strings', function(){
		var t = {
				eins : 1,
				zwei: {
					drei: 3
				}
			},
			f1 = bmoor.makeGetter('');

		expect( f1(t) ).toBe(t);
	});

	it('should have set working', function(){
		var t = {};

		bmoor.set(t,'eins',1);
		bmoor.set(t,'zwei.drei',3);

		expect( t.eins ).toBe(1);
		expect( t.zwei.drei ).toBe(3);
	});

	it('should have makeSetter working', function(){
		var t = {},
			f1 = bmoor.makeSetter('eins'),
			f2 = bmoor.makeSetter('zwei.drei');

		f1(t,1);
		f2(t,3);

		expect( t.eins ).toBe(1);
		expect( t.zwei.drei ).toBe(3);
	});

	it('should have del working', function(){
		var t = {
			eins : 1,
			zwei: {
				drei: 3
			}
		};

		expect( bmoor.del(t,'eins') ).toBe(1);
		expect( bmoor.del(t,'zwei.drei') ).toBe(3);
		expect( t.eins ).toBeUndefined();
		expect( t.zwei ).toBeDefined();
		expect( t.zwei.drei ).toBeUndefined();
	});

	describe('::parse', function(){
		it('should parse an array correctly', function(){
			expect(bmoor.parse([1,2,3]))
			.toEqual([1,2,3]);
		});

		it('should parse dot notation correctly', function(){
			expect(bmoor.parse('1.2.3'))
			.toEqual(['1','2','3']);
		});

		it('should parse brackets correctly', function(){
			expect(bmoor.parse('[1][2][3]'))
			.toEqual(['1','2','3']);
		});

		it('should parse brackets with quotes correctly', function(){
			expect(bmoor.parse('[\'1\']["2"][3]'))
			.toEqual(['1','2','3']);
		});

		it('should parse mixed correctly', function(){
			expect(bmoor.parse('foo["bar"].ok[hello]'))
			.toEqual(['foo','bar','ok','hello']);
		});
	});
});

describe('Testing error handling functionality', function(){
	//loop
	it('should allow looping through array like elements with bmoor.loop', function(){
		var t = [0,1,2,3];

		bmoor.loop(t, function( v, i ){
			expect( v ).toBe( i );

			this[i] = true;
		});

		expect( t ).toEqual( [true,true,true,true] );
	});

	it('should allow looping through array like elements with bmoor.loop, while allowing alternate scope', function(){
		var t = [0,1,2,3],
			t2 = [];

		bmoor.loop(t, function( v, i ){
			expect( v ).toBe( i );

			this[i] = true;
		}, t2);

		expect( t2 ).toEqual( [true,true,true,true] );
	});

	//each
	it('should allow looping through hash\'s own properites with bmoor.each', function(){
		var t = { 
				eins : true
			};

		bmoor.each( t, function(v,k){
			expect( k ).toBe( 'eins' );
			expect( v ).toBe( true );
		});
	});

	it('should allow looping through hash\'s own properites with bmoor.each, while allowing alternate scope', function(){
		var t = { 
				eins : true
			},
			t2 = {};

		bmoor.each( t, function(v,k){
			expect( k ).toBe( 'eins' );
			expect( v ).toBe( true );

			t2[ k ] = v;
		});

		expect( t2 ).toEqual( t );
	});

	//iterate
	it('should allow looping through object\'s own properites, ignoring special vars with bmoor.iterate', function(){
		function f(){
			this.eins = true;
			this._hidden = true;
		}

		f.prototype.foobar = function(){};

		var t = new f(),
			t2 = {};

		bmoor.iterate( t, function(v,k){
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

describe("Testing object functions", function() {
	// mask
	it('should allow for the creation of object from a base object', function(){
		var t,
			v;

		function Foo( derp ){
			this.woot = derp;
		}

		Foo.prototype.bar = 'yay';

		t = new Foo();

		v = bmoor.object.mask( t );

		expect( v.bar ).toBe( 'yay' );
	});


	// extend
	it('should allow for objects to be extended by other objects', function(){
		var t = {
			'foo'  : 1,
			'bar'  : 2 ,
			'woot' : 3
		};

		bmoor.object.extend( t, {
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
			t = bmoor.object.explode({
				hello:'world'
			},{
				'eins': 1, 
				'zwei': 2,
				'drei': 3,
				'foo.bar': 'woot',
				'help.me': o
			});

		expect( t.eins ).toBe( 1 );
		expect( t.foo.bar ).toBe( 'woot' );
		expect( t.hello ).toBe( 'world' );
		expect( t.help.me ).toBe( o );
	});

	it('should allow for a new variable to be created from a map', function(){
		var o = {},
			t = bmoor.object.explode({},
			{
				'eins': 1, 
				'foo.bar': 'woot',
				'hello.world': o
			});

		expect( t.eins, 1 );
		expect( t.foo.bar, 'woot' );
		expect( t.hello.world ).toBe( o );
	});

	/*
	describe('override', function(){
		it( 'should prune old properties', function(){
			var t = {
					eins : 1,
					zwei : {
						foo : 1,
						bar : 2
					}
				}

			bmoor.object.override( t, {
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

			bmoor.object.override( t, o );

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

			bmoor.object.override( t, o, true );

			o.drei.hello = 'woot';

			expect( t.drei.hello ).toBe( 'world' );
		});
	});
	*/
	it( 'should allow for data to be merged', function(){
		var t = {
			eins : 1,
			zwei : {
				foo : 1,
				bar : 2
			},
			drei : 3
		}

		bmoor.object.merge( t, {
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

describe('Testing the test functions', function(){
	// isBoolean
	it('should be able to test booleans', function(){
		expect( bmoor.isBoolean(true) ).toBe( true );
		expect( bmoor.isBoolean(false) ).toBe( true );
		expect( bmoor.isBoolean(1) ).toBe( false );
		expect( bmoor.isBoolean(0) ).toBe( false );
	});
	// isDefined
	it('should be able to test for variables being defined', function(){
		var n = {},
			t;

		expect( bmoor.isDefined(true) ).toBe( true );
		expect( bmoor.isDefined(false) ).toBe( true );
		expect( bmoor.isDefined(1) ).toBe( true );
		expect( bmoor.isDefined(0) ).toBe( true );
		expect( bmoor.isDefined(n) ).toBe( true );
		expect( bmoor.isDefined(t) ).toBe( false );
	});
	// isUndefined
	it('should be able to test for variables being undefined', function(){
		var n = {},
			t;

		expect( bmoor.isUndefined(true) ).toBe( false );
		expect( bmoor.isUndefined(false) ).toBe( false );
		expect( bmoor.isUndefined(1) ).toBe( false );
		expect( bmoor.isUndefined(0) ).toBe( false );
		expect( bmoor.isUndefined(n) ).toBe( false );
		expect( bmoor.isUndefined(t) ).toBe( true );
	});
	// isArray
	it('should be able to test for variables being arrays', function(){
		expect( bmoor.isArray([]) ).toBe( true );
		expect( bmoor.isArray({}) ).toBe( false );
		expect( bmoor.isArray(1) ).toBe( false );
		expect( bmoor.isArray({length:0}) ).toBe( false );
		expect( bmoor.isArray('') ).toBe( false );
	});
	// isArrayLike
	it('should be able to test for variables being array like', function(){
		expect( bmoor.isArrayLike([]) ).toBe( true );
		expect( bmoor.isArrayLike({}) ).toBe( false );
		expect( bmoor.isArrayLike(1) ).toBe( false );
		expect( bmoor.isArrayLike({length:0}) ).toBe( true );
		expect( bmoor.isArrayLike('') ).toBe( false );
	});
	// isObject
	it('should be able to test for variables being an object', function(){
		function f(){}
		var t = new f();

		expect( bmoor.isObject([]) ).toBe( true );
		expect( bmoor.isObject({}) ).toBe( true );
		expect( bmoor.isObject(1) ).toBe( false );
		expect( bmoor.isObject(false) ).toBe( false );
		expect( bmoor.isObject(f) ).toBe( false );
		expect( bmoor.isObject(t) ).toBe( true );
		expect( bmoor.isObject('') ).toBeFalsy();
	});
	// isFunction
	it('should be able to test for variables being a function', function(){
		function f(){}
		var t = new f();

		expect( bmoor.isFunction([]) ).toBe( false );
		expect( bmoor.isFunction({}) ).toBe( false );
		expect( bmoor.isFunction(1) ).toBe( false );
		expect( bmoor.isFunction(false) ).toBe( false );
		expect( bmoor.isFunction(f) ).toBe( true );
		expect( bmoor.isFunction(t) ).toBe( false );
		expect( bmoor.isFunction('') ).toBeFalsy();
	});
	// isNumber
	it('should be able to test for variables being a number', function(){
		function f(){}
		var t = new f();

		expect( bmoor.isNumber([]) ).toBe( false );
		expect( bmoor.isNumber({}) ).toBe( false );
		expect( bmoor.isNumber(1) ).toBe( true );
		expect( bmoor.isNumber(false) ).toBe( false );
		expect( bmoor.isNumber(f) ).toBe( false );
		expect( bmoor.isNumber(t) ).toBe( false );
		expect( bmoor.isNumber('') ).toBeFalsy();
	});
	
	// isString
	it('should be able to test for variables being a function', function(){
		function f(){}
		var t = new f();

		expect( bmoor.isString([]) ).toBe( false );
		expect( bmoor.isString({}) ).toBe( false );
		expect( bmoor.isString(1) ).toBe( false );
		expect( bmoor.isString(false) ).toBe( false );
		expect( bmoor.isString(f) ).toBe( false );
		expect( bmoor.isString(t) ).toBe( false );
		expect( bmoor.isString('') ).toBe( true );
	});
	
	// isEmpty
	it('should be able to test for variables being a function', function(){
		var t;

		expect( bmoor.isEmpty([]) ).toBe( true );
		expect( bmoor.isEmpty({}) ).toBe( true );
		expect( bmoor.isEmpty(0) ).toBe( false );
		expect( bmoor.isEmpty(t) ).toBe( true );
		expect( bmoor.isEmpty(null) ).toBe( false );
		expect( bmoor.isEmpty([0]) ).toBe( false );
		expect( bmoor.isEmpty({'v':0}) ).toBe( false );
	});
});
