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
			
			waiting.require( requirements, function(){
				var 
					i,
					creator = bMoor.get( create ),
					el = new creator( element );
				
				for( i = 0; i < decorators.length; i++ ){
					bMoor.get( decorators[i] )._decorate( el );
				}
			});
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

			args.unshift( element );
			requirements.push( create );
			
			waiting.require( requirements, function(){
				var controller = bMoor.get( create );

				// run the factory attribute, just incase, and then tell the controller to own the element
				controller.own.apply( controller, args );
			});
		},
		build : function( element ){
			var 
				dis = this,
				waiting = bMoor.module.Wait,
				others = [],
				nodes;

			if ( dis._preRender ){
				dis._preRender();
				dis._preRender = null;
			}

			if ( element.hasAttribute('snap-controller') ){
				this._buildControl( waiting, element );
			}

			for( nodes = this.select(element,'[snap-controller]'), i = 0, c = nodes.length; i < c; i++){
				this._buildControl( waiting, nodes[i] );
			}

			if ( element.hasAttribute('snap-class') ){
				this._buildNode( waiting, element );
			}

			for( nodes = this.select(element,'[snap-class]'), i = 0, c = nodes.length; i < c; i++){
				this._buildNode( waiting, nodes[i] );
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