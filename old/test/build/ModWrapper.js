describe('bmoor.build.Wrapper', function(){
	var g1,
		g2;

	function Test( avalue ){
		this.value = avalue;
	}

	Test.prototype.woot = function( input ){
		g1 = input;
	};

	Test.prototype.foobar = function( input ){
		g2 = input;
	};

	Test.prototype.eins = 1;

	Test.prototype.zwei = 'two';

	var TestClass = bMoor.test.make({
		wrap : Test,
		construct : function( input, other ){
			this.$wrap( other );
			this.hello = input;
		},
		properties : {
			foobar : function( input ){
				return this.$wrapped.foobar( input );
			}
		}
	});

	describe('instantiation', function(){
		var t = new TestClass('um-1','um-2');

		it('should pass through a call', function(){
			expect( t.woot ).toBeDefined();
			t.woot('test1');
			expect( g1 ).toBe( 'test1' );
		});

		it('should allow a call with $wrapped', function(){
			expect( t.foobar ).toBeDefined();
			t.foobar('test2');
			expect( g2 ).toBe( 'test2' );
		});

		it('should have the properties', function(){
			expect( t.eins ).toBe( 1 );
			expect( t.zwei ).toBe( 'two' );
			expect( t.value ).toBe( 'um-2' );
			expect( t.hello ).toBe( 'um-1' );
		});
	});
});