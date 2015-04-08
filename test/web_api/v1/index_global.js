var web_api = require('../../../web_api/server')
   , request = require('supertest')
   , co = require('co')
   , async = require('async')
   , valids = require('validator')
   , agent = request.agent('http://local.zmc.io:9070')
   , config = require('../../../config')

var signUpInfo, loginAdminInfo, loginInfo, userToRemove, wrongLoginInfo;
var View_profile_UserID , userIdToRemove, userAccountIdToRemove, UserId, FollowingId, UserAccountId, View_profile_UserAccountId
      , following_userAccountid;
var TopicId, topicPostInfo, topic_groups_id , Topic_zone;
var StoryId, commentPostInfo , anonymousCommentPostInfo, commentPutInfo
      , testCommentIdvar, commentReplyInfo, anonymousCommentReplyInfo, testReplyId, anonymousTestCommentId;
var storyPostInfo , anonymousStoryPostInfo, storyPutInfo , storyMovedIn , testStoryId , testStoryReplyObject , ontologySearch ;
var storyInfoType, storyInfoTopictype, storyPutLayoutInfo, timeout, weblink, wrongWeblink;
var objectPostInfo , objectPutInfo , objectImagePath , objectUpdatedImagePath , testObjectId;
var userFilter, contributorRoleInfo, RoleInfo , UpdateActionInfo , AddActionInfo , AssignroleInfo
var RollbackRoleInfo , ManagingRoleInfo, communityRoleInfo;
var newEmail, newEmailWithAccountid, userFields , updatePrimaryEmail , updateEmail, updateEmailWithAccountId, changePasswordUserInfo, verificationcode, emailid;
var zonePutInfo , zoneIds;
var organizationInfo, organizationUpdateInfo, accountId, AccountcreditId;
var RewardInfo, GetRewardsInfo, addCredit, payoutId, payoutAccountId, creditId, objectRewardPath;
var workerBoolean, redshiftBoolean;
var storyPostAdminInfo, storyAdvertorialType, AdminUserID;
var template_id, editEmailTemplateInfo, sendEmailInfo;
var NotificationId;
var addBlacklistItem, blacklistItemId,storyModerationPostInfo, moderationStoryId;
exports = module.exports = {
    // worker Boolean variable
    workerBoolean :false  // Run "npm start" if workerBoolean is "true"
    , redshiftBoolean :false  // Run "npm start" if redshiftBoolean is "true"
    // User
    , View_profile_UserID : "null"
    , weblink : config.server.externalAppURL
    , wrongWeblink : "http://www.asdfghjklqwertzxcv.com"
    , View_profile_UserAccountId : "null"
    , FollowingId : {"following_userid" : "test123"}
    , FollowingAccountId : {"following_userid" : "null"}
    , UserId : "null"
    , UserAccountId : "null"
    , userIdToRemove : []
    , userAccountIdToRemove : []
    , signUpInfo : {"username":"testfollow@zmc.io","firstname":"testfollow", "password":"testsignfollow", "success_redirect":"http://local.zmc.io:8080/api/v1/zones","failure_redirect":"http://local.zmc.io:8080/api/v1"}
    , wrongLoginInfo : {"username":"test_negative", "password":"test_negative","success_redirect":"http://local.zmc.io:8080/api/v1/zones","failure_redirect":"http://local.zmc.io:8080/api/v1"}
    , loginAdminInfo : {"role":"admin","firstname":"test Admin", "username":"testadminuser@zmc.io", "password":"testadminuser","success_redirect":"http://local.zmc.io:8080/api/v1/zones","failure_redirect":"http://local.zmc.io:8080/api/v1"}
    , userToRemove : {"username":"userToDelete@zmc.io", "password":"userToDelete"}
    , loginInfo : {"username":"test@zmc.io","firstname":"test Login", "password":"testsign","success_redirect":"http://local.zmc.io:8080/api/v1/zones","failure_redirect":"http://local.zmc.io:8080/api/v1"}
    , changePasswordUserInfo : {"new_password":"testsignfollow"}
    , adminChangePasswordUserId : {"new_password":"testsignfollownew"}
    , adminChangePasswordAccountId : {"new_password":"testsignfollow"}
    , userChangePasswordUserId : {"new_password":"testsignfollownew","old_password":"testsignfollow"}
    , userChangePasswordAccountId : {"new_password":"testsignfollow","old_password":"testsignfollownew"}
    // Topic
    , topicPostInfo : {"title":"test login POST topic title","author_name":"test POST topic author","lead_text":"test POST topic lead text"}
    , topicPostInfoToMoveStory : {"title":"test login POST topic title to move story ", "author_name":"test POST topic author", "lead_text":"test POST topic lead text to move story"}
    , TopicId :{"topic_id": null}
    , topic_groups_id : []
    , Topic_zone : []

    // Story
    , StoryId : {"story_id" : "deva-535ac853bae4deee4d2c4a93"}
    , storyPostInfo : {"title": "test POST stories title", "author_name" : "test POST author"}
    , storyPostInfoWithDraft : {"title": "It is ok for title", "author_name" : "test POST author", "lead_text":"Stories are voted by others appreciation. To get good votew, we suggest correct spelling and sentence structure as well as you can"}
    , anonymousStoryPostInfo : {"title": "test POST stories title for anonymous", "author_name" : "anonymous POST author", "is_anonymous" : true}
    , storyPutInfo : {"title" : "test PUT title", "author_name" : "test PUT author"}
    , storyMovedIn : {"topic_id": "deva-53b55471a6619e4a62226379"}
    , testStoryId : []
    , reasonToRejectOrApprove : {"reason": "Genuine Reason"}
    , ontologySearch : {"query":"food","language":"en"}
    , storyInfoType : {"title": "test POST Info stories", "author_name" : "test POST author","type":"info_post"}
    , storyPutInfoWithPublish : {"title": "test POST Info stories for publish", "author_name" : "test POST author"}
    , storyInfoTopictype : {"title": "test POST Info Topic stories ", "author_name" : "test Info topic","type":"info_post"}
    , storyPutLayoutInfo : {"layout_type":"testlayout"}
    , storyPostAdminInfo : {"title": "test POST Admin stories title", "author_name" : "test POST author"}
    , storyAdvertorialType : {"title": "test POST Advertorial stories", "author_name" : "test POST author","type":"adver_post"}
    , pageAdvertorialType : {"title": "test POST Advertorial  Page stories", "author_name" : "test POST author","type":"adver_post"}
    , anonymousNewStoryPostInfo : {"title": "test POST stories title for anonymous by admin", "author_name" : "anonymous POST author By admin", "is_anonymous" : true}
    // Comment
    , commentPostInfo : {"comment":"comment from test", "author_name":"commenter"}
    , anonymousCommentPostInfo : {"comment":"comment from anonymous test", "author_name":"anonymous commenter", "is_anonymous":true}
    , commentPutInfo : {"comment":"comment changed", "author_name":"commenter changed"}
    , commentReplyInfo : {"reply":"reply on comment","author_name":"testAuth"}
    , anonymousCommentReplyInfo : {"reply":"anonymous reply on comment","author_name":"anonymous testAuth", "is_anonymous":true}
    , commentEditReplyInfo : {"reply":"edit reply on comment"}
    , testCommentId : []
    , testReplyId : []

    // Story Object
    , testObjectId : []
    , testStoryReplyObject : {}
    , objectPostInfo : {"type":"image","caption":"China Greatwall", "position":1}
    , objectPutInfo : {"caption":"summer palace"}
    , objectImagePath : "./test/images/greatwall.jpg"
    , objectUpdatedImagePath : "./test/images/summer.jpg"

    // Role
    , userFilter : '{"username":"testfollow","role":"contributor"}'
    , RoleInfo : {"role_name":"test_role","actions":["test_Action"]}
    , UpdateActionInfo : {"actions":["user:revoke_role"]}
    , AddActionInfo : {"actions":["user:assign_role"]}
    , ManagingRoleInfo : {"role_name":"managing editor"}
    , communityRoleInfo : {"role_name":"community editor"}
    , contributorRoleInfo : {"role_name":"contributor"}
    // Email Update
    , newEmail : {"email":"test@zmc.io"}
    , newEmailWithAccountid : {"email":"testaccountid@zmc.io"}
    , userFields : {'primary_email': "testaccountid@zmc.io", 'firstname': "zmc_test",    'lastname': "zmc_last",
                                    'home_town': "zmc_finland", 'gender': "Male",   'phoneno': "8888-8888-88",
                                    'address': "finland",   'username':"test@zmc.io"}
    , updatePrimaryEmail : {"primary_email":"test@zmc.io"}
    , updatePrimaryEmailWithAccountid : {"primary_email":"testaccountid@zmc.io"}
    , updateEmail : {"email":"finland@zmc.io"}
    , updateEmailWithAccountId : {"email":"finlandAccountid@zmc.io"}
    , verificationcode : "null"
    , emailid : "null"
    , wrongemailid : "wrongemailid@zmc.com"

    // Zone
    , zoneIds : []
    , zonePutInfo : {"locale":"en"}
    , organizationInfo: {"fullname": 'TestZonesco', "username": 'TestZonesco', "_type": 'Organizations', "password": 'hrhkhrhk',
                         "emails": [{"email": 'testzonesco@gmail.com', "verification_code": 'testcode'}],
                         "account_id": 'zonesco', "primary_email": 'zonesco@gmail.com',"role": 'contributor'}
    , organizationUpdateInfo: {"fullname":'UpdateTestZonesco',"phoneno":'888-8888-888'}
    , accountId: null
    , AccountcreditId: null
    , following_userAccountid: null

    // Rewards
    , rewardInfo : {"name":"Test Rewards", "price": 10, "quantity": 20, "type": "PaypalReward"}
    , getRewardsInfo : {"quantity": 10, "credits": 500}
    , addCredit : {"credits": 6000}
    , objectRewardPath : "./test/images/greatwall.jpg"
    , addPayoutInfo : {"quantity": 2, "reward_id": null}
    , paypal_reward_id : null

    // Template
    , addEmailTemplateInfo : {"body" : "test email template body","name":"Test email template","subject":"test template subject",
                              "to":"%test_to%","from":"test2@storyby.com","type":"custom",
                              "substitutions":"username,primary_email","subtemplate":"header,footer"}
    , editEmailTemplateInfo : {"name":"Edit email template","to":"%edit_to%"}
    , sendEmailInfo : {"template_name":"","user_id":[]}
    , template_id : null

    // notifications
    , NotificationId : []

    //moderation
    , addBlacklistItem : {"value":"BlackMagic"}
    , blacklistItemId : ""
    , storyModerationPostInfo : {"title": "BlackMagic", "author_name" : "test POST author","lead_text":"StoryBy Netiquette: respect!The ain premise is that the behaviour expected of everyone is the same as that which you expect in physical co-creation space."}
    , moderationStoryId : {}
}