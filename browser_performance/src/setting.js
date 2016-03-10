define(['globalSetting'], function(GS){
	var path = '../../../';
	GS.setPath({
		core: path,
		mvc: path,
		module: path,
		widget: path,
		util: path,
		async: path,
		suites:'./',
		app: './'
	});
}).executeit();