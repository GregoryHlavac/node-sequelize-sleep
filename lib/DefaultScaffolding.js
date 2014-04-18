var _ = require('underscore'),
	Helpers = require('./helpers/Helpers'),
	QueryHelpers = require('./helpers/QueryHelpers');

module.exports = (function() {
	var DefaultScaffolding = { };

	DefaultScaffolding.primaryKeyParameter = function(sModel) {
		return {
			path: Helpers.getIdentifier(sModel),
		    callback: function(req, res, next, id) {
				sModel.model.find(QueryHelpers.buildPrimaryKeySearchParameters(sModel, req, id))
					.complete(function(err, obj) {
						if(err)
							return next(err);
						else if(!obj)
							return next(new Error(sModel.model.name + " failed to load."));

						req[sModel.model.name] = obj;
						next();
					}
				);
			}
		};
	};

	DefaultScaffolding.getRoot = function(sModel) {
		return {
			path: '/',
			callback: function(req, res) {
				sModel.model.findAll(QueryHelpers.buildQueryParameters(sModel, req)).success(function(objs) {
					res.status(200).json(objs);
				}).error(function(err) {
					res.status(404).json(err);
				});
			}
		}
	};

	DefaultScaffolding.getByPrimaryKey = function(sModel) {
		return {
			path: '/:' + Helpers.getIdentifier(sModel),
			callback: function(req, res) {
				res.status(200).json(Helpers.getIdentifiedFromRequest(sModel, req));
			}
		};
	};

	DefaultScaffolding.createNew = function(sModel) {
		return {
			path: '/',
			callback: function(req, res) {
				sModel.model.create(Helpers.buildQueryInsertParameters(sModel, req))
					.success(function(obj) {
						res.setHeader('Location', Helpers.getCurrentURLRoot(req) + '/' + obj.id);
						res
							.status(201)
							.json(obj);
					}).error(function(err) {
						res.status(400).json(err);
					}
				);
			}
		};
	};

	DefaultScaffolding.updateRow = function(sModel) {
		return {
			path: '/:' + Helpers.getIdentifier(sModel),
			callback: function(req, res) {
				var updateColumns = Helpers.buildQueryInsertParameters(sModel, req);
				var obj = Helpers.getIdentifiedFromRequest(sModel, req);

				obj.updateAttributes(updateColumns, _.keys(updateColumns))
					.success(function() {
						res.status(200).json(obj);
					}).error(function(err) {
						res.status(400).json(err);
					}
				);
			}
		};
	};

	DefaultScaffolding.deleteByPrimaryKey = function(sModel) {
		return {
			path: '/:' + Helpers.getIdentifier(sModel),
			callback: function(req, res) {
				var obj = Helpers.getIdentifiedFromRequest(sModel, req);

				var delID = obj.id;

				obj.destroy().success(function() {
					res.status(200).json( { deleted: delID} );
				}).error(function(err) {
					res.status(400).json(err)
				});
			}
		};
	};

	DefaultScaffolding.deleteWhere = function(sModel) {
		return {
			path: '/',
			callback: function(req, res) {
				sModel.model.destroy(QueryHelpers.buildQueryParameters(sModel, req).where)
					.success(function(rows) {
						res.status(200).json({ affectedRows: rows });
					}).error(function(err) {
						res.status(400).json(err);
					}
				);
			}
		};
	};

	return DefaultScaffolding;
})();