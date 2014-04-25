bMoor - Tie your site together
==================================================

bMoor tries to simplify the Object Oriented design for a javascript system.  Inheritance, singletons, and factories are all easily created.  The goal is to standardize the process of generating models and this increase the reusablity of code produced.  By normalizing the expected file structure and how objects are defined, code can be more easily reused, extended, and tested across multiple projects.

Contributions
--------------------------------------------------

Contributions are welcome.

Environment Support
--------------------------------------------------

The intended target environments are both browser and server.  Browser support is targeted to IE9+ and all modern browsers.  For the server environment, that's a future target, but every thing should work beside the autoloading.

Future plans
--------------------------------------------------

I have a TODO.txt where I list what all I plan on working on next.  I'm hoping to get this to beta shortly and relatively stable.  I also know I need to work on the commenting.  That's gonna require some time where I just lock myself away, writing comments and tests.

Patterns Simplified
--------------------------------------------------

1. Inheritance
2. Singleton
3. Factory
4. Decorator
5. Mixin
6. Mocking

Examples - more examples can be found in demos
--------------------------------------------------

### Basic declaration	
	bMoor.make( 'foo.Hello', {
		properties : {
			hello : function(){ 
				console.log('world'); 
			}
		}
	}).then(function( obj ){
		( new obj() ).hello();
	});

### Define a singleton
	bMoor.make( 'foo.Woot',{
		singleton : {
			woot : [ 'the singleton' ]
		},
		construct : function( woot ){
			this.woot = woot || 'hello world';
		},
		properties : {
			hello : function(){
				this.say( this.woot );
			},
			say : function( something ){ 
				console.log( something ); 
			}
		}
	});

	foo.Woot.$woot.hello();
	foo.Woot.$woot.say( 'hello to my little friend' );

### Define a factory
	bMoor.make('foo.Dog', {
		factory : {
			make : function( words ){
				var obj = this;

				return new obj( words );
			}
		},
		construct : function( whatToSay ){
			this.something = whatToSay;
		},
		properties : {
			speak : function(){ 
				console.log( this.something ); 
			}
		}
	});

	obj = foo.Dog.$make('woof');
	obj.speak();

### Decoration
	bMoor.make( 'foo.Decorator1', ['bmoor.core.Decorator', function( Decorator ){
		return {
			parent : Decorator,
			properties : {
				speak : function(){
					this.$wrapped();
					console.log('now roll over');
				}
			}
		};
	}]);

	bMoor.make( 'foo.Pheonix', ['foo.Dog', function( Dog ){
		return {
			parent : Dog,
			construct : function( whatToSay ){
				Dog.call( this, whatToSay );
			},
			decorators : [
				'foo.Decorator1'
			]
		};
	}]).then(function( obj ){
		( new obj('woofie woof') ).speak();
	});

### Requiring remote libraries
	bMoor.make( 'foo.Body', [
		'>jQuery>//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js',
		function( $ ){
			return {
				construct : function(){
					$('body').append('<span>Was Loaded and Created</span>');
				}
			};
		}
	]).then(function( obj ){
		new obj();
	});

### Mixins
	bMoor.define( 'foo.Mixin1', {
		saySomething : function(){
			console.log('wow');
		}
	});

	bMoor.make( 'foo.Hello2', 
		['foo.Hello','foo.Mixin1', function( Hello, Mixin1 ){
			console.log( Mixin1 );
			return {
				parent : Hello,
				construct : function( helloWith ){
					Hello.call( this, helloWith );
				},
				mixins : [
					Mixin1
				]
			};
		}]
	).then(function( obj ){
		var t = new obj();
		console.log( t );
		t.hello();
		t.saySomething();
	});;

### Easily recreate with mock objects
	bMoor.define( 'foo.Mixin2', {
		saySomething : function( words ){
			console.log( 'this is completely fake' );
		}
	});

	bMoor.mock('foo.Hello2', {
		'foo.Hello' : foo.Woot,
		'foo.Mixin1' : foo.Mixin2
	}).then(function( fake ){
		var t = new fake('this is now fake');

		console.log( fake );
		console.log( t );
		
		t.hello();
		t.saySomething( 'like this' );
	});
