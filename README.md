bMoor - Tie your site together
==================================================

bMoor tries to simplify the Object Oriented design for a javascript system.  Inheritance, singletons, and factories are all easily created.  The goal is to standardize the process of generating models and this increase the reusablity of code produced.  By normalizing the expected file structure and how objects are defined, code can be more easily reused, extended, and tested across multiple projects.

Contributions
--------------------------------------------------

Contributions are welcome.

Environment Support
--------------------------------------------------

The intended target environments are both browser and server.  Browser support is targeted to IE9+ and all modern browsers.  For the server environment, that's a future target, but every thing should work beside the autoloading.

Patterns Simplified
--------------------------------------------------

1. Inheritance
2. Singleton
3. Factory
4. Decorator

Examples - full examples can be found in demos
--------------------------------------------------

### Basic declaration	
	var obj = bMoor.define({
		name : 'foo.Hello',
		properties : {
			hello : function(){ 
				console.log('world'); 
			}
		}
	});

	( new obj() ).hello();

### Define a singleton
	bMoor.define({
		name : 'foo.Woot',
		singleton : true,
		properties : {
			say : function( something ){ 
				console.log( something ); 
			}
		}
	});

	foo.$woot.say( 'hello to my little friend' );

### Define a factory
	bMoor.define({
		name : 'foo.Dog',
		factory : true,
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
	bMoor.define({
		name : 'foo.Decorator1',
		parent : 'bmoor.core.Decorator',
		properties : {
			speak : function(){
				this.$wrapped();
				console.log('now roll over');
			}
		} 
	});

	obj = bMoor.define({
		name : 'foo.Pheonix',
		parent : 'foo.Dog',
		decorators : [
			'foo.Decorator1'
		]
	});

	( new obj('woofie woof') ).speak();
