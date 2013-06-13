;(function( $, global, undefined ){
var installed = false;

bMoor.constructor.singleton({
	name : 'Bootstrap',
	namespace : ['bmoor','lib'],
	require : [ ['bmoor','lib','WaitFor'] ],
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
			var
				context = node._snapContext ? node._snapContext : global,
				create = node.getAttribute('snap-class'),
				data = node.hasAttribute('snap-data') 
					? eval( node.getAttribute('snap-data').replace('this','context') ) 
					: null;
			
			// up here, so the require loop doesn't become infinite
			node.removeAttribute('snap-class');
			
			if ( !waiting ){
				waiting = new bmoor.lib.WaitFor();
			}
			
			this.setContext( node, data );
			
			waiting.require( create, function(){
				var 
					creator = bMoor.get( create ),
					el = new creator(
						node,
						node.hasAttribute('snap-template') ? node.getAttribute('snap-template') : null, 
						data
					);
				
				if ( node.hasAttribute('snap-publish') ){
					eval( node.getAttribute('snap-publish').replace('this','context') + ' = el;' )
				}
				
				if ( cb ){
					cb();
				}
			});
		},
		build : function( element ){
			var 
				dis = this,
				waiting = new bmoor.lib.WaitFor(),
				others = [];
			
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
		},
		setContext : function( element, data ){
			for( var nodes = this.select(element,'[snap-class]'), i = 0, c = nodes.length; i < c; i++){
				nodes[i]._snapContext = data;
			}
		}
	}
});

}( jQuery, this ));