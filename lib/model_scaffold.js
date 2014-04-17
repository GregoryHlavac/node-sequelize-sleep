var _ = require('underscore'),
	helper = require('./model_helper');

module.exports = (function() {
	var Scaffold = { };

	/**
	 * Pagination scaffolding, injectable into models as needed to enable them
	 * to be used to paginate over the model.
	 *
	 * @param sModel
	 * @constructor
	 */
	Scaffold.Pagination = function(sModel) {
		return {
			path: '/page',
			callback: function(req, res) {
				sModel.model.findAndCountAll(helper.buildPaginationParameters(sModel, req))
					.success(function(result) {
						res.status(200).json({
							total: result.count,
							current: result.rows.length,
							rows: result.rows
						});
					}).error(function(err) {
						res.status(400).json(err);
					});
			}
		};
	};

	return Scaffold;
})();