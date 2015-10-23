var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express', name: 'Brit', message: 'hello world' });
});


/* GET Userlist page. */
router.get('/lists', function(req, res) {
    var db = req.db;
    var collection = db.get('listcollection');
    collection.find({},{},function(e,lists){
    	res.json(lists);
        // res.render('lists', { title: 'Express', lists: lists });
    });
});

router.get('/list/:id', function(req, res) {
	var id = req.params.id;
    var db = req.db;

    var collection = db.get('listcollection');
    collection.find({_id: id}, {}, function(e,list){
    	res.json(list);
        // res.render('lists', { title: 'Express', lists: lists });
    });
});

router.post('/addlist', function(req, res) {
    var db = req.db;
    var collection = db.get('listcollection');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

module.exports = router;