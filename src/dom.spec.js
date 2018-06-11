describe("bmoor.dom", function() {
	var dom = bmoor.dom;

	describe('::onEvent, ::triggerEvent', function(){
		var root,
			trigger,
			listener;

		beforeEach(function(){
			root = document.createElement('div'),
			trigger = document.createElement('span'),
			listener = document.createElement('div');

			document.body.appendChild( root );
			root.appendChild( listener );
			listener.appendChild( trigger );
		});

		it('should allow triggering and catching a custom event', function( done ){
			dom.onEvent( listener, 'foo-bar', function( data ){
				expect(data).toEqual({hello:'world'});

				done();
			});

			dom.triggerEvent( trigger, 'foo-bar', {hello:'world'} );
		});

		it('should allow catching custom thrown event', function( done ){
			dom.onEvent( listener, 'foo-bar', function( data ){
				expect(data).toEqual({hello:'world'});

				done();
			});

			let event = new CustomEvent('foo-bar', {
					detail: {
						hello: 'world'
					},
					bubbles: true
				});

			trigger.dispatchEvent(event);
		});
	});

	describe('::on', function(){
		var root,
			trigger1,
			trigger2,
			listener;

		beforeEach(function(){
			root = document.createElement('div'),
			trigger1 = document.createElement('span-1'),
			trigger2 = document.createElement('span-2'),
			listener = document.createElement('div');

			document.body.appendChild( root );
			root.appendChild( listener );
			listener.appendChild( trigger1 );
			listener.appendChild( trigger2 );
		});


		it('should allow for qualifiers to be evaluated', function(){
			var span1 = false,
				span2 = false;

			dom.on( listener, {
				'foo-bar': {
					'span-1': function(){
						span1 = true;
					},
					'span-2': function(){
						span2 = true;
					}
				}
			});

			let event = new CustomEvent('foo-bar', {
					detail: {
						hello: 'world'
					},
					bubbles: true
				});

			trigger1.dispatchEvent(event);

			expect( span1 ).toBe( true );
			expect( span2 ).toBe( false );
		});
	});
});