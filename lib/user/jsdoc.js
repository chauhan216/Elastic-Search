/**
 * User subsystem API to external entities
 *
 * @module User:API
 */

'use strict';

var Promise = require('bluebird');
var webshot = Promise.promisify(require('webshot'));
var userDB = require("./user_schema.js");
var roleDB = require("./role_schema.js");
var bcrypt = require('bcrypt-nodejs');
var EmailHelper = require('./email_helper');
var Helper = require('../appHelper');
var config = require('../../config');
var ofs = require('fs');
var path = require('path');
var promisePipe = require("promisepipe");




/**
 * Authorize action based on roles and actions. Check if
 * role allows to do required action.
 * @param opts {hash} Options
 * @param opts.in_role {string} Which role the calling user has
 * @return {null} When action is authorized
 */
exports.authorizeActions = function*(opts) {
  console.log("User API authorizeActions: START" + JSON.stringify(opts));
  if (!opts.actions || !opts.in_role) {
    throw new ('You need to provide role and action');
  }
  var in_role = opts.in_role;
  console.log('User API authorizeActions: role' + in_role);
  console.log('User API authorizeActions: actions' + opts.actions);
  
  var role = yield roleDB.rolesCollection.findOne({ 'name':in_role }).exec();
  if (!role) throw new zmcError.ResourceNotFound('Role does not exists');
  
  // console.log('opts.actions '+opts.actions + 'and rowl '+ role.name);
  if (role.actions.indexOf(opts.actions) == -1) {
    throw new Error('Action does not exists for this role');
  }
}

/**
 * Try signup with username and password
 */
exports.signup = function*(opts) {
  console.log('UserAPI signup: START');
  if (!opts.username || !opts.password) {
    console.log("UserAPI signup: no username or password");
    throw new Error("Username or password cannot be blank");
  }

  opts.username = opts.username.toLowerCase();
  try {	
    var user_new = yield userDB.userCollection.findOne({'username' : opts.username}).exec();
  } catch(err) {
  	throw err;
  }
  console.log("UserAPI/signup user: " +JSON.stringify(user_new));
  if (user_new) {
  	throw new Error("User with same username already exists");
  } else {
    var addedfields = new userDB.userCollection;
    addedfields.username = opts.email;
    addedfields.password = bcrypt.hashSync(opts.password, bcrypt.genSaltSync(8));
    addedfields.fullname = "";
    if (opts.firstname) {
      addedfields.firstname = opts.firstname;
      addedfields.fullname += addedfields.firstname;
    }
    if (opts.lastname) {
      addedfields.lastname= opts.lastname;
      addedfields.fullname += " "+addedfields.lastname;
    }

    addedfields.email = opts.email;

    if (opts.address)
      addedfields.address = opts.address;
    if (opts.phoneno)
      addedfields.phoneno = opts.phoneno;

    var newuseradded = yield Promise.promisify(addedfields.save, addedfields)();

    if (newuseradded) {
      newuseradded[0].event("welcome");
      return newuseradded[0].toObject();
    }
  }
}

/**
 * Try login with username and password
 */
exports.login = function*(opts) {
  console.log('UserAPI login: START');
  if (!opts.username || !opts.password) {
  	throw new Error('Username or password cannot be blank');
  }
  var user = yield userDB.userCollection.findOne({username: opts.username.toLowerCase()}).exec();

  if (!user) {
  	throw new Error('Username or Password does not match');
  } else if (user.status && user.status === 'invited') {
  	throw new Error('Your invitation has not yet been accepted');
  } else if (user.status == 'locked') {
  	throw new Error('You had locked this account and to unlock your account now use forget password');
  }
  console.log('UserAPI login: user (id) found '+ user.id)
  if (bcrypt.compareSync(opts.password, user.password))
    return user.toObject();   
  throw new Error('Username or Password does not match'); 
}


/**
 * Add a new user or return exsting user as per given social profile
 */
exports.socialLogin = function*(opts, mode){
  // console.log("UserAPI/sociallogin: opts - " + JSON.stringify(opts));
  var profile = opts.profile;
  var user = yield userDB.userCollection.findOne({ 'username' : opts.username }).exec();
  // if the user is found, then log them in

  if(!user && mode == "login"){
    throw new Error('You need to signup before logging in');
  }
  if (user) {
    console.log("API sociallogin: existing user");
    return user; // user found, return that user
  } else {
    // console.log("opts.provider is " + opts.provider);
    var userProfileData = new userDB.userCollection;
    userProfileData.role = "user";
    userProfileData.username_type = opts.provider;
    userProfileData.userid = profile.id;
    
    var profile_photo;
    if (opts.provider === 'facebook') {
      if (profile.emails && profile.emails.length>0) {
        // userProfileData.username = profile.id;
        userProfileData.email = profile.emails[0].value.toLowerCase();
        userProfileData.username = profile.emails[0].value;
      }
      if (profile._json.location) {
        // console.log(JSON.stringify(profile._json.location))
        userProfileData.address = profile._json.location.name;
      }
      if (profile.displayName) {
        userProfileData.full_name = profile.displayName;
      }
      if (profile._json.first_name) {
        userProfileData.first_name = profile._json.first_name;
      }
      if (profile._json.last_name) {
        userProfileData.last_name = profile._json.last_name;
      }
      if (!userProfileData.full_name) {
        userProfileData.full_name = "";
        if (userProfileData.first_name)
          userProfileData.full_name += userProfileData.first_name;
        if (userProfileData.last_name)
          userProfileData.full_name += " "+userProfileData.last_name;
      }
      if (profile._json.gender) {
        userProfileData.gender = profile._json.gender;
      }
      if (profile.photos && profile.photos[0] && profile.photos[0].value) {
        userProfileData.avatar = profile.photos[0].value;
      }
      // userProfileData.locale = profile._json.locale;
      // userProfileData.identities = [];
      // userProfileData.identities.push({"userid" : profile.id, "type": profile.provider});
    }
    // console.log(opts.provider === 'twitter');
    if (opts.provider === 'twitter') {
      userProfileData.username = profile.username;
      if (profile.displayName) {
        userProfileData.full_name = profile.displayName;
      }
      
      if (profile._json.location) {
        userProfileData.address = profile._json.location;
      }

      userProfileData.first_name = profile._json.name;

      if (profile._json.profile_image_url) {
        userProfileData.image = profile._json.profile_image_url;
        userProfileData.image = userProfileData.image.replace("_normal", "");
        console.log("userProfileData.avatar === "+userProfileData.image);
      }
    }

    if (opts.provider === 'google') {
      if (profile.emails && profile.emails.length>0) {
        userProfileData.email =  profile.emails[0].value.toLowerCase();
        userProfileData.username = profile.emails[0].value;
      }
      if (profile.displayName) {
        userProfileData.full_name = profile.displayName;
      }
      if (profile.givenName) {
        userProfileData.first_name = profile.givenName;
      }
      if (profile.familyName) {
        userProfileData.last_name = profile.familyName;
      }
      if (profile._json.picture) {
        userProfileData.image = profile._json.picture;
      }
    }
    
    if (userProfileData.image) {
      var options = {
        streamType: 'jpeg',
        screenSize: {
          width: 160,
          height: 160
        },
        shotSize: {
          width: 160,
          height: 160
        },
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 5_1 like Mac OS X) AppleWebKit/534.46 ' +
                  '(KHTML, like Gecko) Version/5.1 Mobile/9B176 Safari/7534.48.3'
      }
      var read_user_image =yield webshot(userProfileData.image, options);
      var image_filename = "user-"+ Helper.uid()+'.jpg';
      var imgTarget = path.join(config.server.images , image_filename);
      yield promisePipe(
        read_user_image,
        ofs.createWriteStream(imgTarget)
      );
      userProfileData.image = imgTarget;
    }

//    if (!userProfileData.primary_email) {
//      throw new zmcError.InvalidInput('User can not signup without an email');
//    }
    var newuser = yield Promise.promisify(userProfileData.save, userProfileData)();
    console.log('UserAPI sociallogin: new user = '+JSON.stringify(newuser))
    if (newuser) {
      if (!user) {
        newuser[0].event("welcome");
      }
      return  newuser[0].toObject();
    }
  }
}

/**
 * Return a user profile
 *
 * @param {string} id - User _id
 * @param {object} auth_user - user handle of authenticated user
 * @return {object} User object
 */
exports.getUserProfile = function*(opts) {
  console.log("UserAPI getUserProfile START" + JSON.stringify(opts));
  //console.log("UserAPI getUserProfile: opts - "+JSON.stringify(opts))
  // check whose profile is fetched

  if (opts.id === 'me') {
    if (!opts.auth_user) return {};
    opts.id = opts.auth_user._id;
  } else {
    throw new Error("You don't have permissions");
  }

  var action = 'user:view_any_profile';
  var role;
 
  yield exports.authorizeActions({
    in_role: opts.auth_user.role || null,
    actions: action
  });

  console.log("UserAPI getUserProfile: fieldsIncluded - ");
  var user = yield userDB.userCollection.findOne({'_id' : opts.id}).exec();

  if (!user) throw new Error('No user found for account_id: ' + opts.id);
  return user.toObject();
}

/**
 * Try login with username and password
 */
exports.findOneByid = function*(opts) {
  console.log('UserAPI findOneByid: START');
  var user = yield userDB.userCollection.findOne({_id: opts.id}).exec();
  if (user) {
    return user;
  }
}


/**
 *  Forgot password
 */
exports.forgotPassword = function*(opts) {
  console.log("User API forgotPassword: START");
  //console.log("user API verifyUser: email: "+ opts.email);
  if (opts.email)
    opts.email = opts.email.toLowerCase();
  else
    throw new Error('Email can not be blank');
  var userForgotPassword = yield userDB.userCollection.findOne({"email": opts.email}).exec();
  if (!userForgotPassword)  throw new Error('There is no user with this Email.');
  var uniqueId = Helper.uid();
  userForgotPassword.fpcode = uniqueId;
  // console.log("user data is " + JSON.stringify(userForgotPassword))
  userForgotPassword.fpcode_expiry = Date.now() + config.fpcodeexpiry.expirytime; // change expiry time in config
  var user = yield Promise.promisify(userForgotPassword.save, userForgotPassword)();
  user[0].event("forgot_password");
  return;
}

/**
 * Reset Password and return User
 *
 * @param {string} id - Global user id
 * @param {object} auth_user - user handle of authenticated user
 * @param {string} old_password - old_password of User
 * @param {string} fpcode - forget password code
 * @param {string} new_password - new_password of User
 *
 * @return {object} Reset - User
 */

exports.resetPassword = function*(opts) {
  console.log("UserAPI resetPassword START");
  if (!opts.new_password) {
    console.log("UserAPI resetPassword: New password not given");
    throw new Error('New password cannot be blank');
  }
  if (!opts.fpcode) { //fpcode is mandatory for resetting own password.
    console.log("UserAPI resetPassword: fp_code is not given");
    throw new Error('fp_code is not given');
  }

  var user;
  var filter = {};
  filter.fpcode = opts.fpcode;
  filter.email = opts.email_id;
  user = yield userDB.userCollection.findOne(filter).exec();
  // console.log("UserAPI resetPassword user:" +JSON.stringify(user));
  if (!user) {
    throw new Error('User does not exists for email: '+ opts.email_id);
  }

  var passwordSuccessfullyReset;
  var password = bcrypt.hashSync(opts.new_password, bcrypt.genSaltSync(8), null);
 // console.log("fpcode passwordexpires:" + user.fpcode_expiry < new Date());
  if (user.fpcode_expiry < new Date()) {
    yield userDB.userCollection.update(filter,{"$unset":{"fpcode":true,"fpcode_expiry":true}}).exec();
    throw new Error('Password expired, Please reset again');
  }
  passwordSuccessfullyReset = yield userDB.userCollection.update(filter,{"$set":{"password":password
                              , "status":"active"},"$unset":{"fpcode":true,"fpcode_expiry":true}}).exec();
 // console.log("UserAPI resetPassword : passwordreset:" +JSON.stringify(passwordSuccessfullyReset));
  if (passwordSuccessfullyReset) {
    user.event("forgot_password");
    return user.toObject();
  }
}

/**
 * changePassword Password and return User
 *
 * @param {string} id - Global user id
 * @param {object} auth_user - user handle of authenticated user
 * @param {string} old_password - old_password of User
 * @param {string} new_password - new_password of User
 *
 * @return {object} Reset - User
 */

exports.changePassword = function*(opts) {
  console.log("UserAPI changePassword START");
  //if (opts.id === 'me') {
    opts.id = opts.id;
  //}
  if (!opts.new_password) {
    console.log("UserAPI changePassword: New password not given");
    throw new Error('New password cannot be blank');
  }

  // if (opts.auth_user && opts.auth_user.id != opts.id && opts.auth_user.account_id != opts.id) { //check if admin is resetting the password
    yield exports.authorizeActions({
      in_role: opts.auth_user.role || null,
      actions: "user:reset_pw_without_old"
    });
  // } else 
  if (!opts.old_password) { //old password is mandatory for Changing own password.
    console.log("UserAPI changePassword: Old password not given");
    throw new Error('Old password cannot be blank');
  }

  var user;
  var filter = {};
  filter._id = opts.id;
  user = yield userDB.userCollection.findOne(filter).exec();
  
  if (!user) {
    throw new Error('User does not exists for id: '+ opts.id);
  } else if (opts.old_password) {
    if (!bcrypt.compareSync(opts.old_password, user.password)) {
      throw new Error('old_password do not match');
    }
  }

  var passwordSuccessfullyChanged;
  var password = bcrypt.hashSync(opts.new_password, bcrypt.genSaltSync(8), null);
  passwordSuccessfullyChanged = yield userDB.userCollection.update(filter,{"$set":{"password":password}}).exec();
  if (passwordSuccessfullyChanged) {
    user.event("change_password");
    return user.toObject();
  }
}