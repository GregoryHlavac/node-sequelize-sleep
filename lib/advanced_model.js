var express = require('express'),
	_       = require('underscore'),
	util        = require('util');

/**
 *
 **/

var getPrimary = function(model) {
	for(var prop in model.rawAttributes){
		if(model.rawAttributes.hasOwnProperty(prop))
		{
			if(model.rawAttributes[prop].primaryKey) return prop;
		}
	}

	return null;
}

var removeUndefined = function(value) {
	return value != undefined;
}

module.exports = (function() {
	var AdvModel = function(options) {
		if(!options.hasOwnProperty('model'))
			throw new Error("Model not defined in options.");

		this.model = options.model;
		this.path = this.model.tableName.toLowerCase();
		this.modelRouter = express.Router();
		this.primaryKey = getPrimary(this.model);

		this.options = _.extend({
			walk_associations: true,
			walk_depth: 1
		}, options.options);

		/**
		 * Extra route options, to add convenience functions to a
		 * route for commonly used shorthands.
		 *
		 * However this also contains the default routes as well.
		 */

		var localModel = this;

		this.extra = {
			params: _.filter(_.flatten(_.zip(
				[
					{
						identifier: localModel.primaryKey,
						callback: function(req, res, next, id) {
							var whereCriteria = _.object([localModel.primaryKey], [id])

							options.model.find({ where: whereCriteria })
								.complete(function(err, obj) {
									if(err)
										return next(err);
									else if(!obj)
										return next(new Error(localModel.name + " failed to load."));

									req[options.model.name] = obj;
									next();
								});
						}
					}
				], options.extra && options.extra.params || []), false), removeUndefined),
			get: _.filter(_.flatten(_.zip(
				[
					{
						path: "/:" + this.primaryKey,
						callback: function(req, res) {
							res.status(200).json(req[options.model.name]);
						}
					}
				], options.extra && options.extra.get || []), false), removeUndefined),
			post: _.filter(_.flatten(_.zip(
				[

				], options.extra && options.extra.post || []), false), removeUndefined),
			put: _.filter(_.flatten(_.zip(
				[

				], options.extra && options.extra.put || []), false), removeUndefined),
			patch: _.filter(_.flatten(_.zip(
				[

				], options.extra && options.extra.patch || []), false), removeUndefined),
			delete: _.filter(_.flatten(_.zip(
				[

				], options.extra && options.extra.delete || []), false), removeUndefined)
		};

		this.protect = _.extend({
			get: [],
			post: [],
			put: [],
			patch: [],
			delete: []
		}, options.protect);

		this.filter = _.extend({
			// If this is filled out, don't allow these parameters to be used.
			blacklist: [],

			// If this is filled out, ONLY allow these parameters to be used.
			whitelist: []
		}, options.filter);

		this.modelRouter.get('/', function(req, res) {
			res.send(200, "Model Base of " + options.model.name);
		});
	}

	AdvModel.prototype.bindModel = function(rt) {
		console.log(this.modelRouter);

		var mr = this.modelRouter;
		var model = this.model;


		_.forEach(this.extra.get, function(getr) {
			mr.get(getr.path, getr.callback);
		});

		_.forEach(this.extra.params, function(pdef) {
			mr.param(pdef.identifier, pdef.callback);
		});

		rt.use('/' + this.path, this.modelRouter);
	}


	return AdvModel;
})();