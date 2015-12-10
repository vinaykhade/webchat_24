  var express=require('express'),
	   app=express(),//invoke express function
	   path=require('path'),
	   cookieParser=require('cookie-parser'),
	   session=require('express-session'),
	   config=require('./config/config.js'),
	   ConnectMongo=require('connect-mongo')(session),
  	   //dbURL='mongodb://chatcatuser:mychatcat@ds043981.mongolab.com:43981/webchat',
	   //mongoose=require('mongoose').connect(dbURL),
	   mongoose=require('mongoose').connect(config.dbURL),
	   passport=require('passport'),
	   FacebookStrategy=require('passport-facebook').Strategy,
	   rooms=[]
  
	 
app.set('views',path.join(__dirname,'views'));
app.engine('html',require('hogan-express'));
app.set('view engine','html');
app.use(express.static(path.join(__dirname,'public'))); 

//session handling
app.use(cookieParser());

var env=process.env.NODE_ENV || 'production';
if(env === 'development'){
	// dev specific settings
	app.use(session({secret:config.sessionSecret,saveUninitialized:true,resave:true}))
	//app.use(session({secret:'dasdjaskdjask',saveUninitialized:true,resave:true}))

}else{
	//production specific settings
	app.use(session({secret:config.sessionSecret,saveUninitialized:true,resave:true,
		//secret:'dasdjaskdjask',saveUninitialized:true,resave:true,
		store:new ConnectMongo({
			//url:config.dbURL,
			//url:'mongodb://chatcatuser:mychatcat@ds043981.mongolab.com:43981/webchat',
			mongooseConnection:mongoose.connections[0],
			stringify:true
			
		})
					
					
	    }))

}


//Testing example
/*var userSchema=mongoose.Schema({
	username:String,
	password:String,
	fullname:String
})

var Person=mongoose.model('users',userSchema);
var John=new Person({
	username:'don',
	password:'don',
	fullname:'don'
})

John.save(function(err){
	console.log('Done!');
})
*/
app.use(passport.initialize());
app.use(passport.session());
require('./auth/passportAuth.js')(passport,FacebookStrategy,config,mongoose);

//route helps in mapping the url to specific responses
require('./routes/routes.js')(express,app,passport,config,rooms);


//app.listen(3000,function(){
//	console.log('ChatCAT working on Port 3000');
//	console.log('Mode:'+ env);
//})

app.set('port',process.env.PORT || 3000);
var server=require('http').createServer(app);
var io=require('socket.io').listen(server);
require('./socket/socket.js')(io,rooms);

server.listen(app.get('port'),function(){
	console.log('WebChat on port :'+ app.get('port'));
})