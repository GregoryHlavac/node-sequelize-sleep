Sequelize-Sleep
====================

Semantically, this API is modeled after
http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api

Starting Guide!
=================
The remainder of this guide assumes the following has already been done.

The options on the sleep object itself can be any of the following

 * limit - The limit on how many records can be returned from ANY query executed that is owned by this sleep instance.

Okay for now there aren't too many options that can be globally specified on the sleep instance..

```javascript
var Sleep = require('sequelize-sleep');
var slp = new Sleep({options...});
```
Creating an API Route
=================
Creating API Routes is a much easier task with this helper and sequelize, almost no manual code is required to get a simple API working in no time.

This example will take into consideration the [Caliper Models] from another project of mine as an example. This also assumes that an Express Application exists with the name 'app'.

```javascript
app.use('/api', sleep.createAPI(
  [
    {
      model: db.Project,
      options: {
        // Included only for the sake of brevity, this is actually the default option.
        walk_associations: true,

        // Walk 2 levels into the association tree.
        walk_depth: 2, // Defaults to 1

        // Allows the root path GET on this model.
        allow_root: true,

        // Limit to maximum of 3 projects per query.
        limit: 3 // WARNING: This isn't defined by default, be careful with your query size.
      },
      routes: {
        get: [
          // Adding an optional pagination route to project to grant it the
          // /page sub-route, right now this requires setting offset/limit/order.
          // The 'get' object this belongs to really just specifies the HTTP-Verb to operate on.
          Sleep.Scaffolding.PaginationRaw
        ]
      },
      associationOptions: {
        releases: {
          // First level of association.
          crashes: {
            // Second level of association
            filter: {
              // We really only care about the signature right now.
              include: ['signature']
            }
			reports: {
			  // Third level of association... And not included due to the depth setting.
			  // No options here, just here to show you how to specify options in associations.
			  // It doesn't matter though actually, as this is never loaded since this is the 'third'
			  // level of association.
			}
          }
        }
      }
    },
    {
      model: db.User,
      filter: {
        // Obviously we don't want people to be able to see another user's password or email.
        exclude: ['password', 'email']
      }
    }
  ]
);
```

The above creates the following routes
 * /api/projects ( GET, POST, PUT, PATCH, DELETE )
    * /:project_id ( GET )
    * /page (GET)
        * /releases ( GET, POST, PUT, PATCH, DELETE )
            * /:release_id ( GET )
                * /crashes ( GET, POST, PUT, PATCH, DELETE )
                    /:crash_id
 * /api/users ( GET, POST, PUT, PATCH, DELETE )
    * /:user_id ( GET )

Scaffolding
=================
Scaffolding in Sleep is used to add new routes to models, currently the general layout of how to define scaffolding is to create a function that returns an object with two variables on it, one that will be used to define the sub-path that it will operate on and the other to define the Express callback this function receives one argument, that being the RESTModel (or AssociationModel) that it belongs to.

An example (Taken from lib/DefaultScaffolding)
```javascript
DefaultScaffolding.getByPrimaryKey = function(sModel) {
	return {
		path: '/:' + Helpers.getIdentifier(sModel),
		callback: function(req, res) {
			res.status(200).json(Helpers.getEntityFromRequest(sModel, req));
		}
	};
};
```

This is how the primary key lookup on a model's route is written, you'll notice that the path utilizes a param binding to get the entity loaded properly.

Two functions of note outside of the typical Express route function to take note of here are
Helpers.getIdentifier(RESTModel);
Helpers.getEntityFromRequest(RESTModel, req);

The first function creates the correct string that corresponds to that model's primary-key lookup param in Express (Assuming you've allowed the Primary Key lookup to function, by default it is added).

The second function simply returns the correct entity from the request based upon how the primary key lookup function embedded it, you can do it by hand but usually it's best to let the framework do this part for you.


[Caliper Models]:https://github.com/GregoryHlavac/Caliper/tree/master/lib/models
