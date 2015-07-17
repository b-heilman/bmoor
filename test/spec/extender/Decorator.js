describe('bmoor.extender.Decorator', function(){
	var Decorator;

	beforeEach(bMoor.test.injector(['bmoor.extender.Decorator', function( D ){
		Decorator = D;
	}]));

	it( 'should have the _$extend function defined', function(){
		expect( Decorator.prototype._$extend ).toBeDefined();
	});

	it( 'should not be able to be constructed', function(){
		var t;

		try {
			new Decorator();
		} catch( e ){
			t = true;
		}

		expect( t ).toBe( true );
	});

	describe( 'extending Decorator', function(){
		var t,
			t2;

		beforeEach(function(){
			t = bMoor.test.make({
					parent: Decorator,
					properties : {
						eins : function(){},
						zwei : function(){}
					}
				});

			t2 = new t();
		});
		
		it( 'should have properties', function(){
			expect( t.prototype.eins ).toBeDefined();
			expect( t.prototype._$extend ).toBeDefined();
		});

		it( 'should copy properties over', function(){
			expect( t2.eins ).toBeDefined();
			expect( t2._$extend ).toBeDefined();
		});
	});

	describe( 'using Decorator', function(){
		var called,
			t,
			t2;

		beforeEach(function(){
			t = bMoor.test.make({
					parent: Decorator,
					properties : {
						eins : function(){
							this.$old();
							expect( this._test ).toBeDefined();
						},
						zwei : function(){},
						_test : 'hello'
					}
				});

			t2 = {
				eins : function(){
					called = true;
				}
			};

			( new t() )._$extend( t2 );
		});
		
		it( 'should copy properties over', function(){
			t2.eins();

			expect( called ).toBe( true );
			expect( t2.zwei ).toBeDefined();
		});
	});

	describe( 'can override _$extend', function(){
		var called,
			t,
			t2;

		beforeEach(function(){
			t = bMoor.test.make({
					parent: Decorator,
					properties : {
						_$extend: function( el ){
							el.isExtended = true;
							Decorator.prototype._$extend.call( this, el );
						},
						sample: function(){
							this.$sample = 'sample';
						},
						$sign: function(){
							this.sign = 'sign';
						},
						_blank: function(){
							this.blank = 'blank';
						}
					}
				});
		});
		
		it( 'should copy properties over via _$extend', function(){
			t2 = {
				eins : function(){
					called = true;
				}
			};

			( new t() )._$extend( t2 );

			t2.eins();

			expect( called ).toBe( true );
			expect( t2.isExtended ).toBeDefined();
		});

		it( 'should copy properties over via _$extend', function(){
			var v;

			t2 = bMoor.test.make({
					construct: function(){
						this.junk = 'ie';
					},
					extend: [
						new t()
					],
					properties : {
						eins : function(){
							called = true;
						},
						_foo: function(){
							this.$bar = 'hello';
						}
					}
				});

			v = new t2();
			v.eins();
			v._foo();
			v.sample();
			v.$sign();
			v._blank();

			expect( called ).toBe( true );
			expect( v.junk ).toBe( 'ie' );
			expect( v.isExtended ).toBeDefined();
			expect( v.$bar ).toBe( 'hello' );
			expect( v.blank ).toBe( 'blank' );
			expect( v.$sample ).toBe( 'sample' );
			expect( v.sign ).toBe( 'sign' );
		});
	});
});