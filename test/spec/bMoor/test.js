describe('Testing the test functions', function(){
	// isBoolean
	it('should be able to test booleans', function(){
		expect( bMoor.isBoolean(true) ).toBe( true );
		expect( bMoor.isBoolean(false) ).toBe( true );
		expect( bMoor.isBoolean(1) ).toBe( false );
		expect( bMoor.isBoolean(0) ).toBe( false );
	});
	// isDefined
	it('should be able to test for variables being defined', function(){
		var n = {},
			t;

		expect( bMoor.isDefined(true) ).toBe( true );
		expect( bMoor.isDefined(false) ).toBe( true );
		expect( bMoor.isDefined(1) ).toBe( true );
		expect( bMoor.isDefined(0) ).toBe( true );
		expect( bMoor.isDefined(n) ).toBe( true );
		expect( bMoor.isDefined(t) ).toBe( false );
	});
	// isUndefined
	it('should be able to test for variables being undefined', function(){
		var n = {},
			t;

		expect( bMoor.isUndefined(true) ).toBe( false );
		expect( bMoor.isUndefined(false) ).toBe( false );
		expect( bMoor.isUndefined(1) ).toBe( false );
		expect( bMoor.isUndefined(0) ).toBe( false );
		expect( bMoor.isUndefined(n) ).toBe( false );
		expect( bMoor.isUndefined(t) ).toBe( true );
	});
	// isArray
	it('should be able to test for variables being arrays', function(){
		expect( bMoor.isArray([]) ).toBe( true );
		expect( bMoor.isArray({}) ).toBe( false );
		expect( bMoor.isArray(1) ).toBe( false );
		expect( bMoor.isArray({length:0}) ).toBe( false );
		expect( bMoor.isArray('') ).toBe( false );
	});
	// isArrayLike
	it('should be able to test for variables being array like', function(){
		expect( bMoor.isArrayLike([]) ).toBe( true );
		expect( bMoor.isArrayLike({}) ).toBe( false );
		expect( bMoor.isArrayLike(1) ).toBe( false );
		expect( bMoor.isArrayLike({length:0}) ).toBe( true );
		expect( bMoor.isArrayLike('') ).toBe( false );
	});
	// isObject
	it('should be able to test for variables being an object', function(){
		function f(){}
		var t = new f();

		expect( bMoor.isObject([]) ).toBe( true );
		expect( bMoor.isObject({}) ).toBe( true );
		expect( bMoor.isObject(1) ).toBe( false );
		expect( bMoor.isObject(false) ).toBe( false );
		expect( bMoor.isObject(f) ).toBe( false );
		expect( bMoor.isObject(t) ).toBe( true );
		expect( bMoor.isObject('') ).toBeFalsy();
	});
	// isFunction
	it('should be able to test for variables being a function', function(){
		function f(){}
		var t = new f();

		expect( bMoor.isFunction([]) ).toBe( false );
		expect( bMoor.isFunction({}) ).toBe( false );
		expect( bMoor.isFunction(1) ).toBe( false );
		expect( bMoor.isFunction(false) ).toBe( false );
		expect( bMoor.isFunction(f) ).toBe( true );
		expect( bMoor.isFunction(t) ).toBe( false );
		expect( bMoor.isFunction('') ).toBeFalsy();
	});
	// isNumber
	it('should be able to test for variables being a number', function(){
		function f(){}
		var t = new f();

		expect( bMoor.isNumber([]) ).toBe( false );
		expect( bMoor.isNumber({}) ).toBe( false );
		expect( bMoor.isNumber(1) ).toBe( true );
		expect( bMoor.isNumber(false) ).toBe( false );
		expect( bMoor.isNumber(f) ).toBe( false );
		expect( bMoor.isNumber(t) ).toBe( false );
		expect( bMoor.isNumber('') ).toBeFalsy();
	});
	// isString
	it('should be able to test for variables being a function', function(){
		function f(){}
		var t = new f();

		expect( bMoor.isFunction([]) ).toBe( false );
		expect( bMoor.isFunction({}) ).toBe( false );
		expect( bMoor.isFunction(1) ).toBe( false );
		expect( bMoor.isFunction(false) ).toBe( false );
		expect( bMoor.isFunction(f) ).toBe( true );
		expect( bMoor.isFunction(t) ).toBe( false );
		expect( bMoor.isFunction('') ).toBeFalsy();
	});
	// isInjectable
	it('should be able to test for variables being a function', function(){
		expect( bMoor.isInjectable([]) ).toBe( false );
		expect( bMoor.isInjectable(function(){}) ).toBe( false );
		expect( bMoor.isInjectable([function(){}]) ).toBe( true );
		expect( bMoor.isInjectable(['a',function(){}]) ).toBe( true );
	});
	// isEmpty
	it('should be able to test for variables being a function', function(){
		var t;

		expect( bMoor.isEmpty([]) ).toBe( true );
		expect( bMoor.isEmpty({}) ).toBe( true );
		expect( bMoor.isEmpty(0) ).toBe( false );
		expect( bMoor.isEmpty(t) ).toBe( true );
		expect( bMoor.isEmpty(null) ).toBe( false );
		expect( bMoor.isEmpty([0]) ).toBe( false );
		expect( bMoor.isEmpty({'v':0}) ).toBe( false );
	});
	// isQuark : TODO
});