var _           = require('lodash'),
	util        = require('util'),
	Helpers     = require('./Helpers');

module.exports = (function() {
	var QueryHelpers = {};

	var orderRegex = /([A-Za-z_]+)?([\\+-])([A-Za-z_]+)/;

	/**
	 * Creates the 'attributes' field that forces a query to adhere to
	 * either the 'include' fields or 'exclude' fields options
	 *
	 * @param model
	 * @param request
	 */
	QueryHelpers._buildAttributes = function(rstModel, request) {
		var filter = rstModel.filter;

		if(filter) {
			var columns = rstModel.validColumns.concat(rstModel.primaryKey);

			if(filter.include.length > 0)
				return _.intersection(filter.include, columns).concat(rstModel.primaryKey);
			else if(filter.exclude.length > 0)
				return _.difference(columns, filter.exclude);
		}
		else return undefined;
	};

	/**
	 * Checks the specified query and destroys any query key values
	 * that are matched within the blacklist. This does not throw an
	 * error if a match is encountered, it just silently drops the value.
	 *
	 * @param rstModel
	 * @param request
	 */
	QueryHelpers._filterBlacklist = function(rstModel, request) {
		return _.omit(
				_.pick(request.query, rstModel.validColumns), rstModel.filter && rstModel.filter.blacklist || []);
	};

	/**d
	 * Checks to assure that no unauthorized values are within the query,
	 * if any invalid values are detected, there is an error thrown.
	 *
	 * @param rstModel
	 * @param request
	 */
	QueryHelpers._filterWhitelist = function(rstModel, query) {
		var invalidKeys = _.intersection(_.keys(query), rstModel.filter && rstModel.filter.whitelist || [])

		if(invalidKeys.length > 0)
			throw new Error({
				reason: "Invalid Key(s) Were Specified that did not conform to the whitelist.",
				json: invalidKeys
			});

		return query;
	};

	/**
	 * Gets a filtered set of data values that correspond to the 'WHERE' of
	 * a query's criteria. Taking into account excluded and included column
	 * values.
	 *
	 * @param rstModel
	 * @param request
	 * @returns {*}
	 */
	QueryHelpers.getFiltered = function(rstModel, request) {
		return QueryHelpers._filterWhitelist(rstModel, QueryHelpers._filterBlacklist(rstModel, request));
	};

	/**
	 * Creates the 'where' field of parameters, including the parent's
	 * primary key if it is needed (in the case of nested associations)
	 *
	 * @param rstModel
	 * @param request
	 * @returns {*}
	 */
	QueryHelpers.buildWhere = function(rstModel, request, overrides) {
		var where = QueryHelpers.getFiltered(rstModel, request);

		if(rstModel.hasOwnProperty('RESTParent'))
		{
			var parentObject = Helpers.getEntityFromRequest(rstModel.RESTParent, request);
			where[rstModel.associatedBy] = parentObject[rstModel.RESTParent.primaryKey];
		}

		if(overrides && overrides.where)
			where = Helpers.mergeObjects(where, overrides.where);

		return where;
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
	QueryHelpers._buildOrder = function(rstModel, request, overrides) {
		var queryData = request.query;

		if(queryData.hasOwnProperty('order'))
		{
			var result = orderRegex.exec(queryData.order);
			if(result)
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
		else if(overrides && overrides.hasOwnProperty('order'))
			return overrides.order;

		return undefined;
	};

	/**
	 * Aware its just one line function for now, but in the future this may change at any time
	 * if I find a need to change it to work for future queries.
	 *
	 * @param rstModel
	 * @param request
	 * @returns {offset}
	 * @private
	 */
	QueryHelpers._buildOffset = function(rstModel, request, overrides) {
		var offset = undefined;

		if(request.query && request.query.hasOwnProperty('offset'))
			offset = request.query.offset;

		if(overrides && overrides.offset)
			offset = overrides.offset;

		return offset;
	};

	/**
	 * Builds a 'limit' parameter for the specified model and request, the order of
	 * precedence in this case is
	 *
	 * Query Limit < Model Limit < Global Limit
	 *
	 * In essence limits in this case work in the exact opposite fashion
	 *
	 * @param rstModel
	 * @param request
	 * @returns {undefined}
	 * @private
	 */
	QueryHelpers._buildLimit = function(rstModel, request, overrides) {
		return Helpers.getOption('limit', rstModel, request);
	};

	/**
	 * Creates the insertion parameters for the specified model using data from
	 * the request passed. This takes into account filtered parameters, so you cannot
	 * use any excluded parameters (or you can only use included parameters if you're
	 * using that instead.)
	 *
	 * @param rstModel
	 * @param request
	 * @returns {*}
	 */
	QueryHelpers.buildInsertParameters = function(rstModel, request) {
		var params = QueryHelpers.getFiltered(rstModel, request);

		if(rstModel.hasOwnProperty('RESTParent'))
		{
			var parentObject = Helpers.getEntityFromRequest(rstModel.RESTParent, request);
			params[rstModel.associatedBy] = parentObject[rstModel.RESTParent.primaryKey];
		}

		return params;
	};

	/**
	 * Builds the query parameters that are used to find data in the database
	 * This takes into account attributes allowed to exist (include/exclude),
	 * order of the returned object(s), the parameters to narrow the search, as
	 * well as the current model's parent if it has one, to narrow the scope of
	 * the query further.
	 *
	 * @param {RESTModel} As the context to build this query data with.
	 * @param request
	 * @returns {{}}
	 */
	QueryHelpers.buildQueryParameters = function(rstModel, request, overrides) {
		var attributes = QueryHelpers._buildAttributes(rstModel, request);
		var order = QueryHelpers._buildOrder(rstModel, request, overrides);
		var offset = QueryHelpers._buildOffset(rstModel, request, overrides);
		var limit = QueryHelpers._buildLimit(rstModel, request, overrides);
		var where = QueryHelpers.buildWhere(rstModel, request, overrides);

		var params = {};

		if(order && !_.isEmpty(order))
			params.order = order;
		if(where && !_.isEmpty(where))
			params.where = where;
		if(attributes && !_.isEmpty(attributes))
			params.attributes = attributes;
		if(offset)
			params.offset = offset;
		if(limit)
			params.limit = limit;

		return params;
	};

	/**
	 * Builds the parameter object to search for something by its primary key.
	 *
	 * If this is used on a child-associated object it will take into account its
	 * current parent's primary key, as to lessen the overall hit to the database.
	 *
	 * @param rstModel
	 * @param request
	 * @param id
	 * @returns {{}}
	 */
	QueryHelpers.buildPrimaryKeySearchParameters = function(rstModel, request, id) {
		var params = {};

		var sqlize = rstModel.model.sequelize;

		var attributes = QueryHelpers._buildAttributes(rstModel, request);

		if(attributes && !_.isEmpty(attributes))
			params.attributes = attributes;

		if(rstModel.hasOwnProperty('RESTParent'))
		{
			var parentObject = Helpers.getEntityFromRequest(rstModel.RESTParent, request);

			if(rstModel.options.hasOwnProperty('alternate'))
			{
				params.where = sqlize.and(
					_.object([rstModel.associatedBy],[parentObject[rstModel.RESTParent.primaryKey]]),
					sqlize.or(
                        _.object([rstModel.options.alternate], [id]),
						_.object([rstModel.primaryKey], [id])
					)
				);
			}
			else
			{
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
		}
		else
		{
			if(rstModel.options.hasOwnProperty('alternate'))
			{
				params.where = sqlize.or(
					_.object([rstModel.primaryKey], [id]),
					_.object([rstModel.options.alternate], [id]));
			}
			else
				params.where = _.object([rstModel.primaryKey], [id]);
		}

		return params;
	};

	return QueryHelpers;
})();