var _ = require('underscore'),
	helper = require('./model_helper');

module.exports = (function() {
	var Defaults = { Parameters: {} };

	Defaults.primaryKeyParameter = function(sModel) {
		this.identifier = sModel.primaryKey;
		this.callback = function(req, res, next, id) {
			var whereCriteria = _.object([sModel.primaryKey], [id])

			sModel.model.find({ where: whereCriteria })
				.complete(function(err, obj) {
					if(err)
						return next(err);
					else if(!obj)
						return next(new Error(sModel.model.name + " failed to load."));

					req[sModel.model.name] = obj;
					next();
				});
		}
	};

	Defaults.getByPrimaryKey = function(sModel) {
		this.path = '/:' + sModel.primaryKey;
		this.callback = function(req, res) {
			res.status(200).json(req[sModel.model.name]);
		}
	};

	Defaults.createNew = function(sModel) {
		this.path = '/';
		this.callback = function(req, res) {
			sModel.model.create(helper.buildQueryInsertParameters(sModel, req))
				.success(function(obj) {
					res.setHeader('Location', helper.getCurrentURLRoot(req) + '/' + obj.id);
					res
						.status(201)
						.json(obj);
				}).error(function(err) {
					res.status(400).json(err);
				});
		}
	};

	Defaults.updateRow = function(sModel) {
		this.path = '/:' + sModel.primaryKey;
		this.callback = function(req, res) {
			var updateColumns = helper.buildQueryInsertParameters(sModel, req);
			var obj = req[sModel.model.name];

			obj.updateAttributes(updateColumns, _.keys(updateColumns))
				.success(function() {
					res.status(200).json(obj);
				}).error(function(err) {
					res.status(400).json(err);
				});
		}
	};

	Defaults.deleteByPrimaryKey = function(sModel) {
		this.path = '/:' + sModel.primaryKey;
		this.callback = function(req, res) {
			var obj = req[sModel.model.name];

			var delID = obj.id;

			obj.destroy().success(function() {
				res.status(200).json( { deleted: delID} );
			}).error(function(err) {
				res.status(400).json(err)
			});
		}
	};

	Defaults.deleteWhere = function(sModel) {
		this.path = '/';
		this.callback = function(req, res) {
			sModel.model.destroy(helper.buildDestroyWhereParameters(sModel, req))
				.success(function(rows) {
					res.status(200).json({ affectedRows: rows });
				}).error(function(err) {
					res.status(400).json(err);
				});
		}
	};

	return Defaults;
})();