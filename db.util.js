const mongoose  =   require('mongoose');
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
});

//On error
mongoose.connection.on('error',function (err) {
    var msg = 'Error occur in mongo '+ err;
    console.log(msg);
    setTimeout(() => {return connectDb()}, 1000);
});

//On disconnected
mongoose.connection.on('disconnected', function () {
    var msg = 'Mongo connection disconnected';
    console.log(msg);
    setTimeout(() => {return connectDb()}, 1000);
});