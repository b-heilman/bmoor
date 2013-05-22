;(function( $, global, undefined ){
var installed = false;

bMoor.constructor.singleton({
	name : 'Builder',
	namespace : ['bmoor','templating'],
	onReady : function(){
		if ( !installed ){
			var checking = false;
			
			installed = true;
			
			setInterval(function(){
				if ( !checking ){
					checking = true;
					
					bmoor.templating.Builder.build( document.body );
					
					checking = false;
				}
			}, 20);
		}
	},
	construct: function(){},
	properties: {
		build : function( element ){
			for( var nodes = document.body.getElementsByTagName("snap"); nodes.length; ){
				var
					node = nodes[0],
					data = node._snapContext ? node._snapContext : global,
					create = node.hasAttribute('snap-class') ? node.getAttribute('snap-class') : null;
				
				if ( create ){
					var creator = bMoor.get( create );
					
					node.parentNode.insertBefore( (new creator(
						node.hasAttribute('snap-tag') ? node.getAttribute('snap-tag') : null, 
						node.hasAttribute('snap-template') ? node.getAttribute('snap-template') : null, 
						node.hasAttribute('snap-data') ? eval( node.getAttribute('snap-data').replace('this','data') ) : {}, 
						node
					)).getElement(), node );
					
					node.parentNode.removeChild( node );
				}else{
					throw 'snap node declared without snap-class attribute';
				}
			}
		},
		setContext : function( element, data ){
			for( var nodes = element.getElementsByTagName("snap"), i = 0, c = nodes.length; i < c; i++ ){
				nodes[i]._snapContext = data;
			}
		}
	}
});

}( jQuery, this ));