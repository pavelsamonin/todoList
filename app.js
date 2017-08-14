var express = require('express'),
    bodyParser = require('body-parser'),
    http = require('http'),
    path = require('path'),
    Sequelize = require('sequelize'),
    _ = require('lodash');


sequelize = new Sequelize('sqlite://' + path.join(__dirname, 'todoist.sqlite'), {
    dialect: 'sqlite',
    storage: path.join(__dirname, 'todoist.sqlite')
});

Project = sequelize.define('projects', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    }
});

Item = sequelize.define('items', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    },
    project_id: {
        type: Sequelize.INTEGER
    },
    priority: {
        type: Sequelize.INTEGER
    }
});

//sequelize.sync().then(function () {
//    Project.create({
//        name: "First Default Project"
//    });
//
//    Project.create({
//        name: "Second Default Project"
//    });
//
//    Project.create({
//        name: "Third Default Project"
//    });
//
//    Item.create({
//        name: "First Default Item",
//        priority: 2,
//        project_id: 1
//    });
//
//    Item.create({
//        name: "Second Default Item",
//        priority: 1,
//        project_id: 1
//    });
//
//    Item.create({
//        name: "Third Default Item",
//        priority: 3,
//        project_id: 1
//    });
//
//    Item.create({
//        name: "First Default Item",
//        priority: 1,
//        project_id: 2
//    });
//
//    Item.create({
//        name: "Second Default Item",
//        priority: 2,
//        project_id: 2
//    });
//
//}).catch(function (e) {
//    console.log("ERROR SYNCING WITH DB", e);
//});

var app = module.exports = express();
app.set('port', process.env.PORT || 8000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

// Projects API

app.route('/api/projects')
    .get(function (req, res) {
        Project.findAll().then(function (projects) {
            res.json(projects);
        })
    })
    .post(function (req, res) {
        var project = Project.build(_.pick(req.body, ['name']));
        project.save().then(function (project) {
            //            res.json(project);
            Project.findAll().then(function (projects) {
                res.json(projects);
            })
        });
    });

app.route('/api/projects/:project_id')
    .get(function (req, res) {
        Project.findById(req.params.project_id).then(function (project) {
            res.json(project);
        });
    })
    .put(function (req, res) {
        Project.findById(req.params.project_id).then(function (project) {
            project.update(_.pick(req.body, ['name'])).then(function (project) {
                res.json(project);
            });
        });
    })
    .delete(function (req, res) {
        Project.findById(req.params.project_id).then(function (project) {
            project.destroy().then(function (project) {
                res.json(project);
            });
        });
    });

// Items API

app.route('/api/items')
    .get(function (req, res) {
        Item.findAll().then(function (items) {
            res.json(items);
        })
    });

app.route('/api/items/:item_id')
    .get(function (req, res) {
        Item.findById(req.params.item_id).then(function (item) {
            res.json(item);
        });
    })
    .put(function (req, res) {
    console.log(req.body)
        Item.findById(req.params.item_id).then(function (item) {
            item.update(_.pick(req.body, ['name', 'priority'])).then(function (item) {
                //                res.json(item);
                Item.findAll({
                    where: {
                        project_id: item.project_id
                    },
                    order: [
                        ['priority', 'ASC'],
                        ['id', 'ASC']
                    ]
                }).then(function (items) {
                    res.json(items);
                })
            });
        });
    })
    .delete(function (req, res) {
        Item.findById(req.params.item_id).then(function (item) {
            item.destroy().then(function (item) {
                //                res.json(item);
                Item.findAll({
                    where: {
                        project_id: item.project_id
                    },
                    order: [
                        ['priority', 'ASC'],
                        ['id', 'ASC']
                    ]
                }).then(function (items) {
                    res.json(items);
                })
            });
        });
    });

app.route('/api/items/:project_id/items')
    .get(function (req, res) {
        Item.findAll({
            where: {
                project_id: req.params.project_id
            },
            order: [
                ['priority', 'ASC'],
                ['id', 'ASC']
            ]
        }).then(function (items) {
            res.json(items);
        })
    })
    .post(function (req, res) {
        var item = Item.build(_.pick(req.body, ['name', 'priority', 'project_id']));
        item.save().then(function (item) {
            //            res.json(item);
            Item.findAll({
                where: {
                    project_id: req.params.project_id
                },
                order: [
                    ['priority', 'ASC'],
                    ['id', 'ASC']
                ]
            }).then(function (items) {
                res.json(items);
            })
        });
    });

// Redirect all non api requests to the index
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Starting express server
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
