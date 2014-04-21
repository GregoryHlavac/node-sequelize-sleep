var _           = require('lodash'),
	util        = require('util');

module.exports = (function() {
	var Helpers = {};

	var removeUndefined = function(value) {
		return value != undefined;
	};

	Helpers.isRootModel = function(rstModel) {
		return !rstModel.hasOwnProperty('RESTParent');
	};

	Helpers.getEntityFromRequest = function(sModel, req) {
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
	 * Merges together the specified objects recursively, appending
	 * arrays together as well (arrays from the extended object are
	 * pre-pended to the array from the base object, putting them before
	 * any array values that may have already existed in the base.
	 *
	 * @param base
	 * @param extend
	 * @returns {*}
	 */
	Helpers.mergeObjects = function(base, extend) {
		return _.merge(base, extend, Helpers.ldArrayMerge);
	};

	Helpers.mergeTriplicate = function(first, second, third) {
		return Helpers.mergeObjects(Helpers.mergeObjects(first, second), third);
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

	Helpers.getCurrentURLRoot = function(req) {
		return req.originalUrl.substr(0, req.originalUrl.indexOf('?'));
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

	return Helpers;
})();