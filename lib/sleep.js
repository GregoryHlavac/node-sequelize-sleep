var express     = require('express'),
	Sequelize   = require('sequelize'),
	_           = require('underscore'),
	util        = require('util');


module.exports = (function() {

	var RestModel = require(__dirname + "/rest_model");

	var Sleep = function(){
		this.restModels = [];
	}

	Sleep.Scaffold = require('./model_scaffold');

	Sleep.prototype.createEndpoint = function(models, authenticationCallback) {
		var apiRouter = express.Router();

		if(arguments.length == 2)
			apiRouter.use(authenticationCallback);

		var rms = this.restModels;

		if(_.isArray(models))
		{
			models.forEach(function(model) {
				if(_.isObject(model))
				{
					if(model.hasOwnProperty('daoFactoryManager'))
					{
						var rm = new RestModel({ model: model});
						rm.bindModel(apiRouter);

						rms[model.name] = rm;
					}
					// This is for 'nested' models that can define their own additional
					// properties on their api endpoints, such as 'helper' extensions.
					else if(model.hasOwnProperty('model'))
					{
						if(!model.hasOwnProperty('model'))
							throw new Error("Model not defined in options object.");

						var rm = new RestModel(model);
						rm.bindModel(apiRouter);

						rms[model.model.name] = rm;
					}
				}
			});
		}
		return apiRouter;
	}


	return Sleep;
})();