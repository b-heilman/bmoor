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