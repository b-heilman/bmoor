;(function( $, global, undefined ){
	
bMoor.constructor.singleton({
	name : 'Snap',
	namespace : ['bmoor','templating'],
	onReady : function(){
		var checking = false;
		setInterval(function(){
			if ( !checking ){
				checking = true;
				for( var nodes = document.body.getElementsByTagName("snap"), i = 0, c = nodes.length; i < c; i++ ){
					var
						node = nodes[i],
						data = node._snapContext ? node._snapContext : global,
						create = node.hasAttribute('snap-class') ? node.getAttribute('snap-class') : null;
						
					if ( create ){
						var creator = bMoor.get( create );
						
						node.parentNode.insertBefore( (new creator(
							node.hasAttribute('snap-tag') ? node.getAttribute('snap-tag') : 'div', 
							node.hasAttribute('snap-template') ? node.getAttribute('snap-template') : null, 
							node.hasAttribute('snap-data') ? eval( node.getAttribute('snap-data').replace('this','data') ) : {}, 
							node
						)).getElement(), node );
						node.parentNode.removeChild( node );
					}else{
						throw 'snap node declared without snap-class attribute';
					}
				}
				checking = false;
			}
		}, 25);
	},
	properties: {
		get : function( template, data, node ){
			return this.run( this.prepare(template), data, node );
		},
		/**
		 * 
		 * @param content string The template content to prepare
		 * @returns {}
		 */
		prepare : function( content ){
			return bMoor.template.getDefaultTemplator().prepare( content );
		},
		run : function( prepared, data, inTag ){
			// TODO : I really don't think I need this anymore
			var template = document.createElement( inTag );

			template.innerHTML = bMoor.template.getDefaultTemplator().run( prepared, data );
			for( var nodes = template.getElementsByTagName("snap"), i = 0, c = nodes.length; i < c; i++ ){
				nodes[i]._snapContext = data;
			}
			
			return template;
		}
	}
});
	
}( jQuery, this ) );