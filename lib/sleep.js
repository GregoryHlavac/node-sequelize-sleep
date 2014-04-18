var express     = require('express'),
	Sequelize   = require('sequelize'),
	_           = require('underscore'),
	util        = require('util');


module.exports = (function() {

	var RestModel = require(__dirname + "/RestModel");

	var Sleep = function(){
		this.restModels = [];
	}

	Sleep.Scaffolding = require('./OptionalScaffolding');

	Sleep.RESTModel = require('./RESTModel');
	Sleep.AssociatedModel = require('./AssociationModel');

	Sleep.prototype.createEndpoint = function(models, authenticationCallback) {
		var apiRouter = express.Router();

		if(arguments.length == 2)
			apiRouter.use(authenticationCallback);

		var THIS = this;
		var rms = this.restModels;

		if(_.isArray(models))
		{
			models.forEach(function(model) {
				if(_.isObject(model))
				{
					if(model.hasOwnProperty('daoFactoryManager'))
					{
						var rm = new RestModel(THIS, { model: model});
						rm.bindModel(apiRouter);

						rms[model.name] = rm;
					}
					// This is for 'nested' models that can define their own additional
					// properties on their api endpoints, such as 'Helpers' extensions.
					else if(model.hasOwnProperty('model'))
					{
						var rm = new RestModel(THIS, model);
						rm.bindModel(apiRouter);

						rms[model.model.name] = rm;
					}
					else
						throw new Error("Model Failed to Load, Not a Sequelize Model or a Custom Model.");
				}
			});
		}
		return apiRouter;
	}


	return Sleep;
})();