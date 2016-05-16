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

	it('should have exec working', function(){
		var t = {
				eins : function( eins ){
					return 1+'-'+eins;
				},
				zwei: {
					drei: function(){
						return 3;
					}
				}
			};

		expect( bmoor.exec(t,'eins',[1]) ).toBe('1-1');
		expect( bmoor.exec(t,'zwei.drei') ).toBe(3);
	});

	it('should have makeExec working', function(){
		var t = {
				eins : function( eins ){
					return 1+'-'+eins;
				},
				zwei: {
					drei: function(){
						return 3;
					}
				}
			},
			f1 = bmoor.makeExec('eins'),
			f2 = bmoor.makeExec('zwei.drei');

		expect( f1(t,[1]) ).toBe('1-1');
		expect( f2(t) ).toBe(3);
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

	it('should load variables in - 1', function(){
		var t = {
				eins : [
					{ a: 1 },
					{ a: 2 }
				]
			};

		expect( bmoor.load(t,'eins[]a') ).toEqual( [1,2] );
	});

	it('should load variables in - 2', function(){
		var t = [
				{ a: 1 },
				{ a: 2 }
			];

		expect( bmoor.load(t,'[]a') ).toEqual( [1,2] );
	});

	it('should allow the making of a loader', function(){
		var t = {
				eins : [
					{ a: 1 },
					{ a: 2 }
				]
			},
			fn = bmoor.makeLoader('eins[]a');

		expect( fn(t) ).toEqual( [1,2] );
	});
});