;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Test1',
	namespace : ['demos'],
	parent : ['bmoor','node','View'],
	require : {
		templates : [
			'test1.jst'
		],
		styles : [
			'test1.css'
		]
	},
	node : {
		className : 'test1-view'
	},
	properties : {
		defaultTemplate : 'test1'
	}
});

}( jQuery, this ));