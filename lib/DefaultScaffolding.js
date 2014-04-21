var _ = require('underscore'),
	Helpers = require('./helpers/Helpers'),
	QueryHelpers = require('./helpers/QueryHelpers');

module.exports = (function() {
	var DefaultScaffolding = { };

	/**
	 * Creates a param callback for the specified model to look it up based
	 * upon its primary key, the :{IDENTIFIER} is based on
	 * {Model_Name}_{Primary_Key}
	 *
	 * @param sModel
	 * @returns {{path: {}, callback: callback}}
	 */
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

	/**
	 * Represents the object that handles root GET requests for each model
	 * this however can be rather expensive, so in the future this will likely
	 * have some sort of customizable LIMIT expression placed into it depending
	 * on each individual model.
	 *
	 * TODO: Returned value size limitations.
	 * TODO: ETag Caching
	 *
	 * @param sModel
	 * @returns {{path: string, callback: callback}}
	 */
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

	/**
	 * Singular GET by primary key off the base model, I"m not really gonna document
	 * it any further than that.
	 *
	 * TODO: ETag Caching
	 *
	 * @param sModel
	 * @returns {{path: string, callback: callback}}
	 */
	DefaultScaffolding.getByPrimaryKey = function(sModel) {
		return {
			path: '/:' + Helpers.getIdentifier(sModel),
			callback: function(req, res) {
				res.status(200).json(Helpers.getEntityFromRequest(sModel, req));
			}
		};
	};

	/**
	 * Creates a new type off the model root specified by the URL parameters, this takes
	 * into account the existing model blacklist/whitelist parameter arrays so that you
	 * cannot submit forbidden values.
	 *
	 * TODO: Force required fields to be filled out.
	 *
	 * @param sModel
	 * @returns {{path: string, callback: callback}}
	 */
	DefaultScaffolding.createNew = function(sModel) {
		return {
			path: '/',
			callback: function(req, res) {
				sModel.model.create(QueryHelpers.buildInsertParameters(sModel, req))
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

	/**
	 * Updates the specified item specified by the primary key using the query
	 * parameters passed, this automatically handles whitelist/blacklist of fields.
	 *
	 * TODO: Make it work for nested routes, query helper needs updating.
	 *
	 * @param sModel
	 * @returns {{path: string, callback: callback}}
	 */
	DefaultScaffolding.updateRow = function(sModel) {
		return {
			path: '/:' + Helpers.getIdentifier(sModel),
			callback: function(req, res) {
				var updateColumns = QueryHelpers.buildInsertParameters(sModel, req);
				var obj = Helpers.getEntityFromRequest(sModel, req);

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

	/**
	 * Deletes a row by primary key.
	 *
	 * @param sModel
	 * @returns {{path: string, callback: callback}}
	 */
	DefaultScaffolding.deleteByPrimaryKey = function(sModel) {
		return {
			path: '/:' + Helpers.getIdentifier(sModel),
			callback: function(req, res) {
				var obj = Helpers.getEntityFromRequest(sModel, req);

				var delID = obj.id;

				obj.destroy().success(function() {
					res.status(200).json( { deleted: delID} );
				}).error(function(err) {
					res.status(400).json(err)
				});
			}
		};
	};

	/**
	 * Mass deletes from the model depending upon the WHERE criteria specified.
	 *
	 * @param sModel
	 * @returns {{path: string, callback: callback}}
	 */
	DefaultScaffolding.deleteWhere = function(sModel) {
		return {
			path: '/',
			callback: function(req, res) {
				sModel.model.destroy(QueryHelpers.buildWhere(sModel, req))
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