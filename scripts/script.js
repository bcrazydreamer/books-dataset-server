const mongoose = require("mongoose");
const request = require("request");
const Book = require("../books.model");
const mongo_url = "mongodb://testinguser:12345test@ds361768.mlab.com:61768/books";

connectDb();
function connectDb(){
    mongoose.connect(mongo_url,{
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    },(err)=>{
        if(err){
            return console.error(err);
        }
    });
}
//On connect
mongoose.connection.on('connected', function () {
    var msg = 'Mongo connected with '+mongo_url;
    console.log(msg);
    return startProcess();
});

//On error
mongoose.connection.on('error',function (err) {
    console.log('Error occur in mongo ',err);
    return process.exit(0);
});

//On disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongo connection disconnected');
    return process.exit(0);
});



function requestISBN13(data,cb){
    var option = {};
    option.url = "https://www.isbn.org/xmljson.php";
    option.form = {
        request_data : '{"isbn":"'+data+'"}',
        request_code : "isbn_convert"
    }
    request.post(option, function(error, resp, body) {
        if (error) {
            console.log(error);
            return cb(error,null);
        } else {
            try{
                body = JSON.parse(body);
                var isbn = body.results.converted_isbn;
                isbn = isbn.split("-").join("");
                if(!isNaN(isbn)){
                    return cb(null,isbn);
                }
            }catch(err){
                cb(null,null);
            }
            return cb(null,body);
        }
    })
}

async function startProcess(){
    try{
        var books = await Book.find({vrf : false},{isbn : 1});
    }catch(err){
        console.log(err);
        return process.exit(0);
    }
    loop(0);
    function loop(idx){
        console.log("Left--->",books.length - idx);
        if(idx === 2){ return process.exit(0)}
        if(isNaN(books[idx].isbn)){return loop(idx + 1)}
        isbn = String(books[idx].isbn);
        if(isbn[0] !== 0){
            isbn = "0"+isbn;
        }
        return requestISBN13(isbn,async (err,result)=>{
            console.log(err,result);
            if(!isNaN(result)){
                result = Number(result);
                try{
                    await Book.updateOne({_id : books[idx]._id},{$set : {isbn13 : result,vrf : true}});
                } catch(err){}
            }
            return loop(idx + 1);
        })
    }
   
}