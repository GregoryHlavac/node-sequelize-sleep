var _           = require('lodash'),
	util        = require('util');

module.exports = (function() {
	var Helpers = {};

	var removeUndefined = function(value) {
		return value != undefined;
	};

	Helpers.getIdentifiedFromRequest = function(sModel, req) {
		return req[sModel.model.name];
	};

	/**
	 * Gets all the models that are associated to the target RESTModel
	 * in a 'HasMany' fashion. And stores them into an object.
	 *
	 * @param sModel
	 * @returns {{}}
	 */
	Helpers.getHasManyAssociations = function(sModel) {
		var hmAssociations = {};

		_.forEach(sModel.model.associations, function(value, key) {
			if(value.associationType === 'HasMany')
			{
				hmAssociations[key] = value.target;
			}
		});

		return hmAssociations;
	};


	Helpers.getIdentifier = function(model) {
		return model.model.name + "_" + model.primaryKey;
	};


	/**
	 *
	 *
	 * @param parent
	 * @param childModel
	 * @returns {*}
	 */
	Helpers.getAssociatedBy = function(parent, childModel) {
		var pName = parent.model.name;

		if(!childModel.associations.hasOwnProperty(pName))
			throw new Error("Model " + childModel.name + " is not associated to " + pName);

		var association = childModel.associations[pName];

		switch(association.associationType)
		{
			case 'BelongsTo':
				return association.identifier;
		}

		return undefined;
	};


	/**
	 * Merges the two arrays together, first goes first and second goes
	 * second, after merging them; it flattens the two arrays into a single
	 * flat array. After its been flattened all undefined values are removed.
	 *
	 * @param first
	 * @param second
	 * @returns {*}
	 */
	Helpers.mergeArrays = function(first, second) {
		return _.filter(_.flatten(_.zip(first, second), false), removeUndefined);
	};


	Helpers.ldArrayMerge = function(a, b) {
		return _.isArray(a) ? b.concat(a) : undefined;
	};

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

	/**
	 * Strips out invalid parameters (parameters that's names are contained
	 * within the valid columns).
	 *
	 * Used to ensure only valid input can be submitted to any query that
	 * inserts or otherwise updates a row in the database.
	 *
	 * @param model
	 * @param request
	 * @returns {*}
	 */
	Helpers.getValidParameters =  function(model, request) {
		return _.pick(request.query, model.validColumns);
	};


	/**
	 * Strips out the valid parameters (parameters that names are contained
	 * within the valid columns).
	 *
	 * @param model
	 * @param request
	 * @returns {*}
	 */
	Helpers.getInvalidParameters = function(model, request) {
		return _.omit(request.query, model.validColumns);
	};


	Helpers.buildDestroyWhereParameters = function(model, request) {
		var rq = request.query;

		return _.pick(rq, model.validColumns);
	};

	Helpers.getCurrentURLRoot = function(req) {
		return req.originalUrl.substr(0, req.originalUrl.indexOf('?'));
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

	var validKeywords = [
		'limit',
		'offset'
	];

	Helpers.buildPaginationParameters = function(model, request) {
		var whereCriteria = this.getValidParameters(model, request);
		var otherCriteria = this.getInvalidParameters(model, request);

		var params = {
			limit: 10,
			offset: 0
		};

		if(whereCriteria)
			params.where = whereCriteria;

		return _.pick(_.extend(params, otherCriteria), validKeywords);
	}


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