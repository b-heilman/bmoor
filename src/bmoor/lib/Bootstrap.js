;(function( $, global, undefined ){
var installed = false;

bMoor.constructor.singleton({
	name : 'Bootstrap',
	namespace : ['bmoor','lib'],
	require : {
		references : { 
			'bMoor.module.Wait' : ['bmoor','lib','WaitFor'],
			'bMoor.module.Schedule' : ['bmoor','lib','Bouncer']
		}
	},
	module : 'Bootstrap',
	onReady : function( self ){
		if ( !installed ){
			var builder = self;
			
			bMoor.constructor.loaded(function(){
				installed = true;
				
				builder.check();
			});
		}
	},
	construct: function(){
		this._render.push(function(){
			document.body.className += ' snap-ready';
		});
	},
	properties: {
		_stopped : false,
		_checking : false,
		_booting : 0,
		_render : [],
		_preRender : null,
		preRender : function( cb ){
			this._preRender = cb;
		},
		done : function( cb ){
			// I don't need to call right away, because it will get cycled and run anyway
			if ( this._booting == 0 ){
				cb();
			}else{
				this._render.push( cb );
			}
		},
		stop : function(){
			this._stopped = true;
		},
		start : function(){
			this._stopped = false;
			this.check();
		},
		check : function(){
			if ( !this._stopped && !this._checking){
				this._checking = true;
				this.build( document.body );
				this._checking = false;
			}
		},
		_buildNode : function( waiting, element ){
			// context -> model -> scope -> variable
			var
				create = element.getAttribute('snap-node'),
				requirements = [],
				visages = [];
			
			// up here, so the require loop doesn't become infinite
			element.removeAttribute('snap-node');
			
			if ( element.hasAttribute('snap-visage') ){
				visages = element.getAttribute('snap-visage').split(',');
				requirements = visages.slice(0);
			}

			requirements.push( create );
			 
			return {
				requirements : requirements,
				build : function(){
					var 
						i,
						node = bMoor.get( create ),
						el = new node( element, {}, true );
					
					for( i = 0; i < visages.length; i++ ){
						bMoor.get( visages[i], true )._decorate( el );
					}

					el.init();
				}
			};
		},
		_buildController : function( waiting, element ){
			var
				create = element.getAttribute('snap-controller'),
				args = [],
				requirements = [],
				stints = [],
				pos;
			
			// up here, so the require loop doesn't become infinite
			element.removeAttribute('snap-controller');
			
			if ( element.hasAttribute('snap-stint') ){
				stints = element.getAttribute('snap-stint').split(',');
				requirements = stints.slice(0);
			}

			pos = create.indexOf( '(' );
			// TODO : this is pretty weak
			if ( pos >= 0 ){
				args = create.substring( pos + 1, create.length - 1 ).trim().split(',');
				create = create.substring( 0, pos );
			}

			requirements.push( create );
			
			return {
				requirements : requirements,
				build : function(){
					var 
						i,
						controller = bMoor.get( create ),
						el = new controller( element, {}, args, true );

					for( i = 0; i < stints.length; i++ ){
						bMoor.get( stints[i], true )._decorate( el );
					}

					el.init();
				}
			};
		},
		build : function( element ){
			var 
				i,
				c,
				dis = this,
				waiting = bMoor.module.Wait,
				schedule = bMoor.module.Schedule,
				res,
				nodes,
				builds = [],
				requirements = [];

			// right now I just want DOM elements
			if ( element.hasAttribute ){
				this._booting++;
				
				if ( dis._preRender ){
					dis._preRender();
					dis._preRender = null;
				}

				if ( element.hasAttribute('snap-controller') ){
					res = this._buildController( waiting, element );
					requirements = requirements.concat( res.requirements );
					builds.unshift( res.build );
				}

				for( nodes = this.select(element,'[snap-controller]'), i = 0, c = nodes.length; i < c; i++){
					res = this._buildController( waiting, nodes[i] );
					requirements = requirements.concat( res.requirements );
					builds.unshift( res.build );
				}

				if ( element.hasAttribute('snap-node') ){
					res = this._buildNode( waiting, element );
					requirements = requirements.concat( res.requirements );
					builds.unshift( res.build );
				}


				for( nodes = this.select(element,'[snap-node]'), i = 0, c = nodes.length; i < c; i++){
					res = this._buildNode( waiting, nodes[i] );
					requirements = requirements.concat( res.requirements );
					builds.unshift( res.build );
				}
				
				schedule.done(function(){
					var op;

					if ( dis._render ){
						while( dis._render.length){
							op = dis._render.shift();
							op();
						}
					}

					dis._booting--;
				});

				waiting.require( requirements );
				waiting.done( function(){
					while( builds.length ){
						schedule.add( builds.pop() );
					}
					
					schedule.run(); 
				});
			}
		},
		select : function( element, selector ){
			if ( element.querySelectorAll ){
				return element.querySelectorAll( selector );
			}else{
				return $(element).find( selector );
			}
		}
	}
});

}( jQuery, this ));