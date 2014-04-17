var express = require('express');

/**
 *
 **/

module.exports = (function() {
	var SimpleModel = function(model) {
		this.model = model;
		this.path = model.tableName.toLowerCase();
		this.modelRouter = express.Router();



		this.modelRouter.get('/', function(req, res) {
			res.send(200, "Model Base of " + model.name);
		});
	}


	SimpleModel.prototype.bindModel = function(rt) {
		rt.use('/' + this.path, this.modelRouter);
	}

	return SimpleModel;
})();