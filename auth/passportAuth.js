module.exports= function(passport,FacebookStrategy,config,mongoose){
	
	 var chatUser=new mongoose.Schema({
	 	
		 profileID:String,
		 fullname:String,
		 profilePic:String
	 
	 })
	 
	 var userModel=mongoose.model('chatUser',chatUser);
	
	passport.serializeUser(function(user,done){
		done(null,user.id)	
		})
	
		passport.deserializeUser(function(id,done){
		userModel.findById(id,function(err,user){
		done(err,user);
		})	
	
	})
		
	passport.use(new FacebookStrategy({
		clientID:config.fb.appID,
		clientSecret:config.fb.appSecret,
		callbackURL:config.fb.callbackURL,
		 
		/*clientID:"922780027810974",
		clientSecret:"32aac175e84cc7df10a1ba9217242ce8",
		callbackURL:"http://localhost:3000/auth/facebook/callback",
	   */
		profileFields:['id','displayName','photos']
	
	},function(accessToken,refreshToken,profile,done){
		//Check  if the user exists in our MOngoDB
		//if not,create one and return the profile
		//if the user exists,simply return the profile
		
		userModel.findOne({'profileID':profile.id},function(err,result){
			if(result){
				done(null,result);
			}else{
				
				//create a new user in mongolab accnt
				var newChatUser=new userModel({
				
				profileID:profile.id,
				fullname:profile.displayName,
				profilePic:profile.photos[0].value || ''
				});
				
				
				newChatUser.save(function(err){
					done(null,newChatUser);
				})
		
			}
		})
	
	}))
	
}