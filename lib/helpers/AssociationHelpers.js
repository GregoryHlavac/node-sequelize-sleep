var _           = require('lodash'),
	util        = require('util'),
	Helpers     = require('./Helpers'),
	QueryHelper = require('./QueryHelpers');

module.exports = (function() {
	var AssociationHelpers = {};

	AssociationHelpers.buildQuerySearchParameters = function(rstModel, req) {
		var parentObject = Helpers.getIdentifiedFromRequest(rstModel.RESTParent, req);

		var params = QueryHelper.buildQueryParameters(rstModel, req);

		/**
		 *  Set the parent search params, if we're using association urls we don't want to bother
		 *  allowing the query to search outside the ownership of its parent.
		 */
		params.where[rstModel.associatedBy] = parentObject[rstModel.RESTParent.primaryKey];

		return params;
	};

	return AssociationHelpers;
})();