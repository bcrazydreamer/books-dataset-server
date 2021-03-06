const express        = require('express');
const app            = express();
const bodyParser     = require('body-parser');
const path           = require('path');
const morgan         = require('morgan');
const helmet         = require('helmet');
const compression    = require('compression');
const cors           = require('cors');
const bv             = require('bvalid');
const Books          = require('./books.model');

const port = 9000;

require('./utils/db.util');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

//Security
app.use(helmet());

//Performance
app.use(compression());

//Cors
app.use(cors());


app.use(express.static(path.join(__dirname,"public")));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if ('OPTIONS' === req.method) {
      return res.status(200).end();
    }
    return next();
});

app.options("*",function(req,res,next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.status(200).end();
});

app.get('/', async function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
  console.log(ip);
  return res.status(200).json({status : true,ip : ip});
})

app.post('/', async function(req, res, next) {
  var data = req.body;
  var ob = {};
  var s = {};
  var limit = 500;
  var skip = 0;
  var prj = {};
  try{
    if(bv.isString(data.book) && data.book.trim().length > 0){
      s.$or = [{title : new RegExp(data.book.trim(),"ig")},{original_title : new RegExp(data.book.trim(),"ig")}]
    }
    if(bv.isString(data.author) && data.author.trim().length > 0){
      s.authors = new RegExp(data.author.trim(),"ig");
    }
    if(!isNaN(data.limit) && Number(data.limit) < 500){limit = Number(data.limit)}
    if(!isNaN(data.skip)){skip = Number(data.skip)}
    if(bv.isObject(data.prj)){prj = data.prj}
  }catch(err){}
  try{
    ob.success = true;
    ob.data = await Books.find(s,prj,{skip : skip,limit : limit,sort : {average_rating : -1}});
  }catch(error){
    ob.success = false;
    ob.data = {};
    return res.status(500).json(ob);
  }
  return res.status(200).json(ob);
});

app.post('/bookdataset', async function(req, res, next) {
  var data = req.body;
  var ob = {};
  var s = {};
  var limit = 500;
  var skip = 0;
  var prj = {};
  try{
    if(bv.isString(data.book) && data.book.trim().length > 0){
      s.$or = [{title : new RegExp(data.book.trim(),"ig")},{original_title : new RegExp(data.book.trim(),"ig")}]
    }
    if(bv.isString(data.author) && data.author.trim().length > 0){
      s.authors = new RegExp(data.author.trim(),"ig");
    }
    if(!isNaN(data.limit) && Number(data.limit) < 500){limit = Number(data.limit)}
    if(!isNaN(data.skip)){skip = Number(data.skip)}
    if(bv.isObject(data.prj)){prj = data.prj}
  }catch(err){}
  try{
    ob.success = true;
    ob.data = await Books.find(s,prj,{skip : skip,limit : limit,sort : {average_rating : -1}});
  }catch(error){
    ob.success = false;
    ob.data = {};
    return res.status(500).json(ob);
  }
  return res.status(200).json(ob);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  if(err.message){
    var errMsg = err.message;
  }else{
    var errMsg = err;
  }
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.send(errMsg);
});

app.listen(port);
console.log('started application on port' + port);
exports = module.exports = app;
