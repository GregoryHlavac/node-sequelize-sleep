var _ = require('underscore'),
	Helpers = require('./helpers/Helpers'),
	QueryHelpers = require('./helpers/QueryHelpers'),
	AssociationHelpers      = require('./helpers/AssociationHelpers');

module.exports = (function() {
	var AssociationScaffolding = { };

	AssociationScaffolding.primaryKeyParameter = function(sModel) {
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


	AssociationScaffolding.getRoot = function(sModel) {
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

	AssociationScaffolding.getRootById = function(sModel) {
		return {
			path: '/:' + Helpers.getIdentifier(sModel),
			callback: function(req, res) {
				var obj = Helpers.getIdentifiedFromRequest(sModel, req);
				res.status(200).json(obj);
			}
		}
	};

	return AssociationScaffolding;
})();