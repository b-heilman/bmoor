;(function( $, global, undefined ){
var installed = false;

bMoor.constructor.singleton({
	name : 'Bootstrap',
	namespace : ['bmoor','lib'],
	require : {
		references : { 'bMoor.module.Wait' : ['bmoor','lib','WaitFor'] }
	},
	module : 'Bootstrap',
	onReady : function( self ){
		if ( !installed ){
			var builder = self;
			
			installed = true;
			
			builder.check();
			
			setInterval(function(){
				builder.check();
			}, 25);
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
		_build : function( waiting, node, cb ){
			// context -> model -> scope -> variable
			var
				create = node.getAttribute('snap-class'),
				requirements = [],
				decorators = [];
			
			// up here, so the require loop doesn't become infinite
			node.removeAttribute('snap-class');
			
			if ( node.hasAttribute('snap-decorator') ){
				decorators = node.getAttribute('snap-decorator').split(',');
				requirements = decorators.slice(0);
			}

			requirements.push( create );
			
			waiting.require( requirements, function(){
				var 
					i,
					creator = bMoor.get( create ),
					el = new creator( node );
				
				for( i = 0; i < decorators.length; i++ ){
					bMoor.get( decorators[i] )._decorate( el );
				}

				if ( cb ){
					cb();
				}
			});
		},
		build : function( element ){
			var 
				dis = this,
				waiting = bMoor.module.Wait,
				others = [];

			if ( dis._preRender ){
				dis._preRender();
				dis._preRender = null;
			}

			for( var nodes = this.select(element,'[snap-class]'), i = 0, c = nodes.length; i < c; i++){
				var node = nodes[i];
				
				if ( node.hasAttribute('snap-publish') ){
					this._build( waiting, node );
				}else{
					others.push( node );
				}
			}
			
			for( var i = 0, c = others.length; i < c; i++ ){
				this._build( waiting, others[i] );
			}
			
			waiting.done(function(){
				if ( dis._render ){
					dis._render();
					dis._render = null;
				}
			});
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