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
				
				setInterval(function(){ builder.check(); }, 25);
			});
		}
	},
	construct: function(){
		this._render = function(){
			document.body.className += ' snap-ready';
		};
	},
	properties: {
		_stopped : false,
		_checking : false,
		_render : null,
		_preRender : null,
		preRender : function( cb ){
			this._preRender = cb;
		},
		render : function( cb ){
			// I don't need to call right away, because it will get cycled and run anyway
			this._render = cb;
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
				create = element.getAttribute('snap-class'),
				requirements = [],
				decorators = [];
			
			// up here, so the require loop doesn't become infinite
			element.removeAttribute('snap-class');
			
			if ( element.hasAttribute('snap-decorator') ){
				decorators = element.getAttribute('snap-decorator').split(',');
				requirements = decorators.slice(0);
			}

			requirements.push( create );
			 
			return {
				requirements : requirements,
				build : function(){
					var 
						i,
						node = bMoor.get( create ),
						el = new node( element );
					
					for( i = 0; i < decorators.length; i++ ){
						bMoor.get( decorators[i] )._decorate( el );
					}
				}
			};
		},
		_buildControl : function( waiting, element ){
			var
				create = element.getAttribute('snap-controller'),
				args = [],
				requirements = [],
				pos;
			
			// up here, so the require loop doesn't become infinite
			element.removeAttribute('snap-controller');
			
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
						controller = bMoor.get( create ),
						el = new controller( element, {}, args );
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
				requirements = [];

			if ( dis._preRender ){
				dis._preRender();
				dis._preRender = null;
			}

			if ( element.hasAttribute('snap-controller') ){
				res = this._buildControl( waiting, element );
				requirements = requirements.concat( res.requirements );
				schedule.add( res.build );
			}

			for( nodes = this.select(element,'[snap-controller]'), i = 0, c = nodes.length; i < c; i++){
				res = this._buildControl( waiting, nodes[i] );
				requirements = requirements.concat( res.requirements );
				schedule.add( res.build );
			}

			if ( element.hasAttribute('snap-class') ){
				res = this._buildNode( waiting, element );
				requirements = requirements.concat( res.requirements );
				schedule.add( res.build );
			}

			for( nodes = this.select(element,'[snap-class]'), i = 0, c = nodes.length; i < c; i++){
				res = this._buildNode( waiting, nodes[i] );
				requirements = requirements.concat( res.requirements );
				schedule.add( res.build );
			}
			
			schedule.done(function(){
				if ( dis._render ){
					dis._render();
					dis._render = null;
				}
			});

			waiting.require( requirements );
			waiting.done( function(){ schedule.run(); });
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