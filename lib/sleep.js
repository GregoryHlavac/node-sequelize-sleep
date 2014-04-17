var express     = require('express'),
	Sequelize   = require('sequelize'),
	_           = require('underscore'),
	util        = require('util');


module.exports = (function() {

	var SimpleModel = require(__dirname + "/simple_model"),
		AdvancedModel = require(__dirname + "/advanced_model");

	var Sleep = {
		createEndpoint: function(models, authenticationCallback) {
			var apiRouter = express.Router();


			if(arguments.length == 2)
				apiRouter.use(authenticationCallback);

			if(_.isArray(models))
			{
				models.forEach(function(model) {
					if(_.isObject(model))
					{
						/**
						 *  Raw Model, exposes everything only protected by the second argument
						 *  to createAPI, the auth callback.
						**/
						if(model.hasOwnProperty('daoFactoryManager'))
						{
							var sm = new SimpleModel(model);
							sm.bindModel(apiRouter);
						}
						// This is for 'nested' models that can define their own additional
						// properties on their api endpoints, such as 'helper' extensions.
						else if(model.hasOwnProperty('model'))
						{
							var am = new AdvancedModel(model);
							am.bindModel(apiRouter);
						}
					}
				});
			}
			return apiRouter;
		}
	};

	return Sleep;
})();