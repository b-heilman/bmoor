describe("bmoor.object", function() {
	it("should operate explode correctly", function(){
		var t = {
				'eins.zwei': 12,
				'eins.drei': 13,
				'fier': 4
			}

		expect( bmoor.object.explode(t) ).toEqual({
			eins: {
				zwei: 12,
				drei: 13
			},
			fier: 4
		});
	});

	it("should operate makeExploder correctly", function(){
		var t = {
				'eins.zwei': 12,
				'eins.drei': 13,
				'fier': 4
			},
			explode = bmoor.object.makeExploder( Object.keys(t) );

		expect( explode(t) ).toEqual({
			eins: {
				zwei: 12,
				drei: 13
			},
			fier: 4
		});
	});

	it("should operate implode correctly", function(){
		var t = {
				time: {
					start: 99,
					stop: 100
				},
				id: 'woot',
				foo: {
					bar: {
						hello: 'world'
					}
				}
			}

		expect( bmoor.object.implode(t) ).toEqual({
			'time.start': 99,
			'time.stop': 100,
			'id': 'woot',
			'foo.bar.hello': 'world'
		});
	});

	it("should operate implode correctly - with an ignore", function(){
		var t = {
				time: {
					start: 99,
					stop: 100
				},
				id: 'woot',
				foo: {
					bar: {
						hello: 'world'
					}
				}
			}

		expect( bmoor.object.implode(t,{time:{start:true},id:true,foo:true}) ).toEqual({
			'time.stop': 100
		});
	});

	describe('::merge', function(){
		it('should replace null correctly', function(){
			expect( bmoor.object.merge({
				foo: null,
				bar: { a: 'ok'},
				hello: {
					world: 1,
					other: 'thing'
				}
			},{
				foo: 'bar',
				bar: null,
				hello: {
					world: null
				}
			}))
			.toEqual({
				foo: 'bar',
				bar: null,
				hello: {
					world: null,
					other: 'thing'
				}
			})
		});
	});
});