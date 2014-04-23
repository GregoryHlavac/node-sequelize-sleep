var _ = require('lodash'),
	Helpers = require('./helpers/Helpers'),
	QueryHelpers = require('./helpers/QueryHelpers'),
	util        = require('util');


var _buildPaginationParameters = function(rstModel, request) {
	var params = QueryHelpers.buildQueryParameters(rstModel, request);

	var defaultParams = {
		limit: 10,
		offset: 0
	};

	return Helpers.mergeObjects(defaultParams, params);
};

module.exports = (function() {
	var Scaffolding = { };

	/**
	 * Pagination scaffolding, injectable into models as needed to enable them
	 * to be used to paginate over the model.
	 *
	 * @param sModel
	 * @constructor
	 */
	Scaffolding.PaginationRaw = function(sModel) {
		return {
			path: '/page',
			callback: function(req, res) {
				sModel.model.findAndCountAll(_buildPaginationParameters(sModel, req))
					.success(function(result) {
						res.status(200).json({
							total: result.count,
							current: result.rows.length,
							rows: result.rows
						});
					}).error(function(err) {
						res.status(400).json(err);
					}
				);
			}
		};
	};

	/**
	 *
	 * TODO: Write, and write its param binding.
	 *
	 * @param sModel
	 * @returns {{path: string, callback: callback}}
	 * @constructor
	 */
	Scaffolding.PaginationPageID = function(sModel) {
		return {
			path: '/page/:pageID',
			callback: function(req, res) {

			}
		};
	};

	return Scaffolding;
})();