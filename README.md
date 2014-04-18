node-sequelize-sleep
====================

RESTful API helper for use with Sequelize and Express 4




Take a load off.. Get some **Sleep** and let it do the heavy lifting for you.


Minimally Viable!

What Works!

Simple API Endpoints!

Simple Example!
```javascript
var sleep = new Sleep();

app.use('/api', sleep.createEndpoint(
		[
			{
				model: db.Project,
				routes: {
					get: [
						Sleep.Scaffolding.Pagination
					]
				}
			}
		]
	)
);
```

Project is a simple Sequelize Model in this case with 'id' and 'title' fields.

It also has a one-to-many relationship with another model not shown here called 'Release'.

By default Sleep will walk one deep (And only can walk one deep right now) into the association tree for
one-to-many relationships and extrapolates accordingly.

ie now available endpoints on that server are..

/api/projects


* /api
    * /projects GET => List of projects.
        * /:id => GET project with ID
            /releases GET => List of Releases on Project
            /:release_id => Get Release with ID on Project.
        * /page => GET simple pagination API


The default route also contains the typical GET/POST/PUT/PATCH/DELETE.

Semantically, this API is modeled after
http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api

Another thing to keep in mind here, is that currently (Will change soon) only the root model (not associated)
has all the extra route data nested within it.