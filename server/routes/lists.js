var express = require('express');
var router = express.Router();

/*
 * GET userlist.
 */
router.get('/lists', function(req, res) {
    // var db = req.db;
    // var collection = db.get('lists');
    // collection.find({},{},function(e,docs){
    //     res.json(docs);
    // });
	res.render('index', { title: 'Lists' });
});

module.exports = router;