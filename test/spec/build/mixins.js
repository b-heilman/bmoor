describe('bmoor.build.Mixins', function(){
	var t,
		g = {};

	it ( 'should allow for a base class to be defined', function(){
		bMoor.make('test.Class', [function(){
			return {
				construct : function SomeClass( t ){
					
				},
				properties : {
					foo : 0,
					bar : 1
				}
			};
		}], g);

		expect( bMoor.isFunction(g.test.Class) ).toBe( true );
	});
	
	it ( 'should allow for mixins to be applied to classes', function(){
		bMoor.make('test.Mixed', [function(){
			return {
				construct : function testMixed(){
					this.woot = 1;
				},
				mixins : [
					{ 
						'foo' : 'bar'
					},
					{ 
						'hello' : function(){ 
							return 'world';
						}
					}
				]
			};
		}], g);

		expect( bMoor.isFunction(g.test.Mixed) ).toBe( true );
	});

	it ( 'should allow for mixins to be applied to classes', function(){
		bMoor.make('test.Mixin', ['test.Class', function( C ){
			return {
				parent : C,
				construct : function testMixing(){
					this.woot = 1;
				},
				mixins : [
					{ 
						'foo' : 'eins'
					},
					{ 
						'hello' : 'world'
					}
				],
				properties : {
					'hello' : 'there'
				}
			};
		}], g);

		expect( bMoor.isFunction(g.test.Mixin) ).toBe( true );

		t = new g.test.Class();

		expect( t.foo ).toBe( 0 );
		expect( t.bar ).toBe( 1 );

		t = new g.test.Mixed();

		expect( t.foo ).toBe( 'bar' );

		t = new g.test.Mixin();

		expect( t.foo ).toBe( 'eins' );
		expect( t.hello ).toBe( 'there' );
	});
});