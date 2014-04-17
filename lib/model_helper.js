var _           = require('underscore'),
	util        = require('util');

module.exports = (function() {
	var Helpers = {};

	/**
	 * Gets the private key of the model specified.
	 *
	 * @param model
	 * @returns { The private key field of the model. }
	 */
	Helpers.getPrimaryKey = function(model) {
		for(var prop in model.rawAttributes){
			if(model.rawAttributes.hasOwnProperty(prop))
			{
				if(model.rawAttributes[prop].primaryKey) return prop;
			}
		}

		return null;
	};


	Helpers.buildDestroyWhereParameters = function(model, request) {
		var rq = request.query;

		return _.pick(rq, model.validColumns);
	};


	/**
	 * Creates the query parameters dependent upon the parameters specified
	 * within the request from the client, any fields that do not have to do
	 * with ordering or any other `meta` query stuff will be stripped from the
	 * query to avoid messing up things.
	 *
	 * @param request
	 * @returns {{where: *}}
	 */
	Helpers.buildQuerySearchParameters = function(model, request) {
		var rq = request.query;

		var params = {};
		params.where = rq;

		return params;
	};


	/**
	 * Creates the parameter object for the to be inserted row on this model
	 * this filters out 'bad' values by removing request query values by eliminating
	 * any that are not in the model's valid columns.
	 *
	 * @param model
	 * @param request
	 * @returns {*}
	 */
	Helpers.buildQueryInsertParameters = function(model, request) {
		return _.pick(request.query, model.validColumns);
	};

	return Helpers;
})();