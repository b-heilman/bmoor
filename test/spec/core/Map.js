describe('Testing bmoor.core.Map', function(){
	var t,
		result;

	bMoor.define('test.Map', ['bmoor.core.Map', function( Map ){
		return {
			parent : Map,
			construct : function( content ){
				Map.prototype._construct.call( this, content );
				this.woot = 'wootwoot';
				this.name = this.firstName + ' ' + this.lastName;
			},
			properties : {
				hello : function( io ){
					result = io;
				}
			}
		};
	}]);

	beforeEach(function(){
		t = new test.Map({
			firstName : 'John',
			lastName : 'Doey',
			eins : 1,
			zwei : 2,
			drei : 3
		});
	});

	it('should run the constructor', function(){
		expect( t.name ).toBe( 'John Doey' );
	});

	it('should copy over attributes', function(){
		expect( t.firstName ).toBe( 'John' );
	});

	it('should have default properties', function(){
		expect( t.toJson ).toBeDefined();
	});

	it('should call properties', function(){
		t.hello( 'woot' );
		expect( result ).toBe( 'woot' );
	});
});