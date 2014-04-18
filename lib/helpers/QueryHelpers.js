var _           = require('lodash'),
	util        = require('util'),
	Helpers     = require('./Helpers');

module.exports = (function() {
	var QueryHelpers = {};

	var orderRegex = /([A-Za-z_]+)?([\+\-])([A-Za-z_]+)/;

	/**
	 * Creates the 'attributes' field that forces a query to only
	 * return the specified fields.
	 *
	 * @param model
	 * @param request
	 */
	QueryHelpers.buildAttributes = function(rstModel, request) {
		return rstModel.filter && rstModel.filter.fields || undefined;
	};

	/**
	 * Checks the specified query and destroys any query key values
	 * that are matched within the blacklist. This does not throw an
	 * error if a match is encountered, it just silently drops the value.
	 *
	 * @param rstModel
	 * @param request
	 */
	QueryHelpers.filterBlacklist = function(rstModel, request) {
		return _.omit(
				_.pick(request.query, rstModel.validColumns), rstModel.filter && rstModel.filter.blacklist || []);
	};

	/**
	 * Checks to assure that no unauthorized values are within the query,
	 * if any invalid values are detected, there is an error thrown.
	 *
	 * @param rstModel
	 * @param request
	 */
	QueryHelpers.filterWhitelist = function(rstModel, query) {
		var invalidKeys = _.intersection(_.keys(query), rstModel.filter && rstModel.filter.whitelist || [])

		if(invalidKeys.length > 0)
			throw new Error({
				reason: "Invalid Key(s) Were Specified that did not conform to the whitelist.",
				json: invalidKeys
			});

		return query;
	};

	QueryHelpers.buildWhere = function(rstModel, queryParams) {
		return queryParams;
	};

	/**
	 *
	 * Planned Format
	 * +field_name -> '`field_name` ASC'
	 * -field_name -> '`field_name` DESC'
	 *
	 * @param rstModel
	 * @param request
	 * @returns {undefined}
	 */
	QueryHelpers.buildOrder = function(rstModel, query) {
		if(query.hasOwnProperty('order'))
		{
			var result = orderRegex.exec(query.order);
			if(result != null)
			{
				/**
				 * Associated include sort.
				 */
				if(result[1])
				{

				}
				else
				{
					var safe = _.contains(rstModel.validColumns.concat(rstModel.primaryKey), result[3]);
					if(safe)
						return util.format('`%s` %s', result[3], result[2] === '+' ? 'ASC' : 'DESC');
				}
			}
		}
		return undefined;
	};

	QueryHelpers.buildQueryParameters = function(rstModel, request) {
		var attributes = QueryHelpers.buildAttributes(rstModel, request);
		var order = QueryHelpers.buildOrder(rstModel, request.query);

		var blFiltered = QueryHelpers.filterBlacklist(rstModel, request);
		var wlFiltered = QueryHelpers.filterWhitelist(rstModel, blFiltered);

		var where = QueryHelpers.buildWhere(rstModel, wlFiltered);

		var params = { where: {} };

		if(order)
			params.order = order;
		if(where)
			params.where = where;
		if(attributes && attributes.length > 0)
			params.attributes = attributes;

		if(rstModel.hasOwnProperty('RESTParent'))
		{
			var parentObject = Helpers.getIdentifiedFromRequest(rstModel.RESTParent, request);
			params.where[rstModel.associatedBy] = parentObject[rstModel.RESTParent.primaryKey];
		}

		return params;
	};

	QueryHelpers.buildPrimaryKeySearchParameters = function(rstModel, request, id) {
		var params = {};

		var attributes = QueryHelpers.buildAttributes(rstModel, request);

		if(attributes && attributes.length > 0)
			params.attributes = attributes;

		/**
		 * Modify the search parameters to take into account a models parent
		 * model and utilize its primary key to associate the two before searching it.
		 */
		if(rstModel.hasOwnProperty('RESTParent'))
		{
			var parentObject = Helpers.getIdentifiedFromRequest(rstModel.RESTParent, request);

			params.where = _.object(
				[
					rstModel.primaryKey,
					rstModel.associatedBy
				],
				[
					id,
					parentObject[rstModel.RESTParent.primaryKey]
				]);
		}
		else
		{
			params.where = _.object([rstModel.primaryKey], [id])
		}

		return params;
	};

	return QueryHelpers;
})();