;(function( $, global, undefined ){
	
bMoor.constructor.singleton({
	name : 'Snap',
	namespace : ['bmoor','templating'],
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
			var 
				tokens = -1,
				ops = 'var n, t;',
				sub = bMoor.template.getDefaultTemplator();
			
			// I want to allow more actions
			content = content.replace(/this\._(append)\(([^;]*);/g,function( match, action, command ){
				tokens++;
				command = command.substring( 0, command.length - 1 ); // prune the trailing ')'
				ops += ' n = '+command+'; t = template.getElementsByTagName("tElement'+tokens+'")[0];'
					+ 't.parentNode.insertBefore( n.getElement(), t );'
					+ 't.parentNode.removeChild( t );';
				
				return '<tElement'+tokens+'></tElement'+tokens+'>';
			});
			
			return {
				'sub'   : sub,
				'cache' : sub.prepare( content ),
				'ops'   : new Function( 'template', ops )
			};
		},
		run : function( prepared, data, node ){
			var 
				template = document.createElement( node ? node : 'div'),
				sub = prepared.sub.run( prepared.cache, data );

			template.innerHTML = sub;
			prepared.ops.call( data, template );
			
			return node ? template : template.innerHTML;
		}
	}
});
	
}( jQuery, this ) );