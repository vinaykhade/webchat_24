module.exports=function(express,app,passport,config,rooms){
	
var router=express.Router();
	
	router.get('/',function(req,res,next){
		res.render('index',{title:'Welcome to WebChat'});
	})
	
	function securePages(req,res,next){
	
		if(req.isAuthenticated()){
			next();
		}else{
			res.redirect('/');
		}
	}
	
	router.get('/auth/facebook',passport.authenticate('facebook'));
	router.get('/auth/facebook/callback',passport.authenticate('facebook',{
	
		successRedirect:'/chatrooms',
		failureRedirect:'/'
	
	})) 
	
	router.get('/chatrooms',securePages,function(req,res,next){
	
		res.render('chatrooms',{title:'Chatrooms',user:req.user,config:config});
	})
	
	//router.get('/room',function(req,res,next){
	
	//	res.render('room',{title:'rooms'});
	//})
	
	router.get('/room/:id',securePages,function(req,res,next){
		var room_name=findTitle(req.params.id);
		res.render('room',{user:req.user,room_number:req.params.id,room_name:room_name,config:config})
	
	})
	
	function findTitle(room_id){
		var n=0;
		while(n<rooms.length){
			if(rooms[n].room_number==room_id){
				return rooms[n].room_name;
				break;
			}else{
				n++;
				continue;
			}
		}
	}
	router.get('/logout',function(req,res,next){
		req.logOut();
		req.session.destroy();
		setTimeout(function() {
    		res.redirect('/');
		}, 2000);
		//res.end();
	})
	
	var exceptionOccured = false;

	process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    exceptionOccured = true;
    process.exit();
	});

	process.on('exit', function(code) {
    if(exceptionOccured) console.log('Exception occured');
    else console.log('Kill signal received');
	});
	
	/*router.get('/setcolor',function(req,res,next){
		req.session.favColor="Red";
		res.send('Setting fav color');
	
	})
	
	router.get('/getcolor',function(req,res,next){
		res.send('Favourite Color:'+(req.session.favColor==undefined?"Not found":req.session.favColor))	
		
	})
	*/
	
	app.use('/',router);
}

