var express     = require('express'),
	_           = require('lodash'),
	util        = require('util');


module.exports = (function() {

	var RestModel = require(__dirname + "/RestModel");

	var Sleep = function(){
		this.restModels = [];
	}

	/**
	 * Contains additional (optional) scaffolding that can be attached
	 * to any API route to grant the additional capabilities within that
	 * Scaffolding to that route.
	 *
	 * @type {exports}
	 */
	Sleep.Scaffolding = require('./OptionalScaffolding');

	/**
	 * Controls a Model's route on this sleep object, this is usually
	 * ~/RESTModel.model.tableName.toLower()
	 *
	 * Sub-Associated models on the route are based on
	 * ~/RESTModel.model.tableName.toLower()/{Primary-Key}/AssociationModel.model.tableName.toLower()
	 *
	 * @type {exports}
	 */
	Sleep.RESTModel = require('./RESTModel');

	/**
	 * Association Model that is related to a RESTModel that controls how
	 * its associated routes will act, and also the associations-associated routes
	 * these can be nested almost indefinitely.
	 *
	 * @type {exports}
	 */
	Sleep.AssociationModel = require('./AssociationModel');

	/**
	 * Creates a new RESTModel with the specified object, usually you
	 * shouldn't call this by hand as its more just an internal function.
	 *
	 * However it can be called if needed, it either expects a raw Sequelize
	 * model, or an object that contains a 'model' field that contains that
	 * Sequelize model, along other options to specify how the model should act
	 * and upon what routes it should use or not use, as well as optional per-route
	 * authentication.
	 *
	 * @param obj
	 * @returns {undefined}
	 */
	Sleep.prototype.createModel = function(obj) {
		var rm = undefined;

		if(obj.hasOwnProperty('daoFactoryManager'))
		{
			rm = new RestModel(this, { model: obj});
		}
		// This is for 'nested' models that can define their own additional
		// properties on their api endpoints, such as 'Helpers' extensions.
		else if(obj.hasOwnProperty('model'))
		{
			rm = new RestModel(this, obj);
		}
		else
			throw new Error("Model Failed to Load, Not a Sequelize Model or a Custom Model.");

		return rm;
	};

	/**
	 * Creates a new {"express".e.Router} with all the specified models attached to it
	 * under the specified authentication callback as well if it exists. Models
	 * has to either be a singular object (Either has to be a regular model or an
	 * object that contains that model under a 'model' key along with associated options
	 * and other settings for that model.) or an array that contains the above.
	 *
	 * @param models
	 * @param authenticationCallback
	 * @returns {"express".e.Router}
	 */
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
					var rm = THIS.createModel(model);
					rm.bindModel(apiRouter);
					rms[rm.model.name] = rm;
				}
			});
		}
		else if (_.isObject(models))
		{
			var rm = THIS.createModel(model);
			rm.bindModel(apiRouter);
			rms[rm.model.name] = rm;
		}

		return apiRouter;
	}


	return Sleep;
})();