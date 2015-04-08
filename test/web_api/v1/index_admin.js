var web_api = require('../../../web_api/server')
   , request = require('supertest')
   , co = require('co')
   , async = require('async')
   , valids = require('validator')
   , agent = request.agent('http://local.zmc.io:9070')
   , indexGlobalAPI = require('./index_global.js')
   , UserAdminAPI = require('../../../lib/user/user_admin.js')
   , Promise = require('bluebird')

  var app = web_api.callback(); 

  describe ('Admin Role Test Cases', function() {
      
    it('Post should work for /login', function(done) {
      co(function *() {
        agent
          .post('/api/v1/login')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.signUpInfo)
          .expect(302)
          .expect('Content-Type', /text\/html/)
          //.expect(hasSaneRedirectURL)
          .end(function(err, res){
            agent.saveCookies(res)
            if (err) return err;
              done();
          });
      })()
    })

    it('Post should work for /user', function(done) {
       co(function *() {
        agent
          .get('/api/v1/users/me')
          .set('Host', 'test.localhost')
          .end(function(err, res){
            indexGlobalAPI.View_profile_UserID = res.body.id;
            indexGlobalAPI.View_profile_UserAccountId = res.body.account_id;
            indexGlobalAPI.sendEmailInfo.user_id[0] = res.body.id;
             if (err) return err;
             done();
          });
      })()
    })

    it('Post should work for /logout', function(done) {
      co(function *() {
        agent
          .post('/api/v1/logout')
          .set('Host', 'test.localhost')
          .end(function(err, res){
            agent.saveCookies(res);
            if (err) return err;
              done();
         });
      })()
    })

    it('Role Admin should be able Verify User Email', function(done){
      co(function *() {
        indexGlobalAPI.verificationcode = yield UserAdminAPI.get_verification_code({"username":indexGlobalAPI.loginAdminInfo.username});
        agent
          .post('/api/v1/email/' + indexGlobalAPI.loginAdminInfo.username + '/verificationcode/' + indexGlobalAPI.verificationcode)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role Admin-user Post should work for /login Admin', function(done) {
      co(function *() {
        agent
          .post('/api/v1/login')
          .set('Host', 'test.localhost')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send(indexGlobalAPI.loginAdminInfo)
          .expect(302)
          .expect('Content-Type', /text\/html/)
         // .expect(hasSaneRedirectURL)
          .end(function(err, res){
            agent.saveCookies(res)
            if (err) return err;
              done();
          });
      })()
    })
 
    it('Post should work for /user', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/me')
          .end(function(err, res){
            indexGlobalAPI.AdminUserID = res.body.account_id;
            console.log("indexGlobalAPI.AdminUserID:" + indexGlobalAPI.AdminUserID);
            if (err) return err;
            done();
          });
      })()
    })

    it('Post should work for test/v1/signup admin', function(done) {
      co(function *() {
        agent
          .post('/api/v1/signup')
          //  .set('Content-Type', 'application/x-www-form-urlencoded')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.userToRemove)
          .expect(200)
          .expect('Content-Type',/application\/json/)
          //    .expect(hasSaneRedirectURL)
          .end(function(err, res){
            console.log("-------------------- PRINTING ERR - "+err)
            console.log("-------------------- PRINTING RES - "+JSON.stringify(res.errors))
            indexGlobalAPI.userAccountIdToRemove[0] = res.body.account_id;
            if (err) return err;
            done();
          });
      })()
    })

    it('Delete should work for test/v1/remove user admin with account_id', function(done) {
      co(function *() {
        agent
          .delete('/api/v1/users/'+ indexGlobalAPI.userAccountIdToRemove[0])
          .set('Host', 'test.localhost')
          .expect(200)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it ('Get should work for test/v1/users', function(done) {
      agent
        .get('/api/v1/users?filter='+indexGlobalAPI.userFilter)
        .set('Host', 'test.localhost')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if (err) return err;
          done();
        });
    })

    it('Role Admin-content:"get_all_stories" should return all stories', function(done){
      co(function *(){
        agent
          .get('/api/v1/stories')
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) throw err;
            done();
          });
      })()
    })


    it ('Post should work for test/v1/roles', function(done) {
        agent
          .post('/api/v1/roles')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.RoleInfo)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            RoleID = res.body[0]._id;
            console.log("ROle ID in describe:" + JSON.stringify(RoleID));
            RoleName = res.body[0].name;
            if (err) return err;
            done();
          });
    })
      
    it ('Post should work for "already exist Role" POST NEGATIVE test case test/v1/roles', function(done) {
      agent
        .post('/api/v1/roles')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.RoleInfo)
        .expect(400)
        .expect('Content-Type', /text\/plain/)
        .end(function(err, res){
          if (err) return err;
          done();
        });
    })

    it ('should work for UPDATE New Action  PUT test/v1/roles/:role_id', function(done) {
      co(function *() {

        agent
          .put('/api/v1/roles/' + RoleID)
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.UpdateActionInfo)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    }) 

    it ('should work for UPDATE New Action "NEGATIVE" Test case  PUT test/v1/roles/:role_id', function(done) {
      co(function *() {
      var WrongRoleID = "888a078bcfbd0b7d01166dec";
        agent
          .put('/api/v1/roles/' + WrongRoleID)
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.UpdateActionInfo)
          .expect(400)
          .expect('Content-Type', /text\/plain/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })     
    
    it ('should work for Add Action POST test/v1/roles/:role_id', function(done) {
      co(function *() {
        agent
          .post('/api/v1/roles/' + RoleID)
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.AddActionInfo)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
              if (err) return err;
              done();
          });
      })()
    })

    it ('should work for Add Action POST "NEGATIVE test case" test/v1/roles/:role_id', function(done) {
      co(function *() {
      var WrongRoleID = "888a078bcfbd0b7d01166dec";
        agent
          .post('/api/v1/roles/' + WrongRoleID)
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.AddActionInfo)
          .expect(400)
          .expect('Content-Type', /text\/plain/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it ('Post should work for  DELETE Action test/v1/roles/:role_id/action/:action_name', function(done) {
      co(function *() {
        agent
          .delete('/api/v1/roles/' + RoleID +'/action/'+ indexGlobalAPI.UpdateActionInfo.actions[0])
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()    
    })

    it ('Post should work for  DELETE Action "NEGATIVE test case" test/v1/roles/:role_id/action/:action_name', function(done) {
      co(function *() {
      var WrongRoleID = "888a078bcfbd0b7d01166dec";
        agent
          .delete('/api/v1/roles/' + WrongRoleID +'/action/'+ indexGlobalAPI.UpdateActionInfo.actions[0])
          .set('Host', 'test.localhost')
          .expect(400)
          .expect('Content-Type', /text\/plain/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()    
    })

    it ('Post should work for  DELETE role "NEGATIVE test case" test/v1/roles/:role_id', function(done) {
      co(function *() { 
      var WrongRoleID = "888a078bcfbd0b7d01166dec";
        agent
          .delete('/api/v1/roles/' + WrongRoleID)
          .set('Host', 'test.localhost')
          .expect(400)
          .expect('Content-Type', /text\/plain/)
          .end(function(err, res){
              if (err) return err;
              done();
          });
      })()      
    })

    it ('Post should work for  DELETE role test/v1/roles/:role_id', function(done) {
      co(function *() {  
        agent
          .delete('/api/v1/roles/' + RoleID)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          // .expect()
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()      
    })

    it ('should work for Add Item to blacklist', function(done) {
      co(function *() {
        agent
          .post('/api/v1/moderation/blacklist')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.addBlacklistItem)
          .expect(200)
          .expect (createBlackList) 
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err) return err;
            indexGlobalAPI.blacklistItemId = res.body.entry.id
            done();
          });
      })()
    })

    it ('should work for Add Item to blacklist', function(done) {
      co(function *() {
        agent
          .get('/api/v1/moderation/blacklist')
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect (getBlackList) 
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })
    
    it('Post should work for /user Role Admin-user:view_own_profile', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/me')
          .set('Host', 'test.localhost')
          .end(function(err, res){
            indexGlobalAPI.FollowingId.following_userid = res.body.id;
            indexGlobalAPI.FollowingAccountId.following_accountid = res.body.account_id;
            if (err) return err;
              done();
          });
      })()
    }) 
   
    it('Post should work for /user Role Admin-user:view_any_profile', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.View_profile_UserID)
          .set('Host', 'test.localhost')
          .end(function(err, res){
            UserId = [res.body.id];
            UserAccountId = [res.body.account_id];
            if (err) return err;
              done();
          });
      })()
    })

    it('Post should work for /user Role Admin-user:view_any_profile account_id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.View_profile_UserAccountId)
          .set('Host', 'test.localhost')
          .end(function(err, res){
            UserId = [res.body.id];
            UserAccountId = [res.body.account_id];
            if (err) return err;
            done();
          });
      })()
    })

    it('POST should work for /organizations', function(done) {
      co(function *() {
        agent
          .post('/api/v1/organizations')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.organizationInfo)
          .expect (200)
          .end(function(err, res){
            if (err) return err;
            indexGlobalAPI.accountId = res.body.account_id;
            done();
          });
      })()
    })

    it('PUT should work for /organizations/:accountId', function(done) {
      co(function *(){
        agent
          .put ('/api/v1/organizations/' + indexGlobalAPI.accountId)
          .set ('Host', 'test.localhost')
          .send (indexGlobalAPI.organizationUpdateInfo)
          .expect (200)
          .expect ('Content-Type', /json/)
          .end (function (err, res) {
            if (err) return err;
            done ();
          });
      })()
    })

    it('Role Admin GET should work for /organisations/:accountId Role Admin-user:get_all_organizations', function(done) {
      co(function *() {
        agent
          .get('/api/v1/organizations')
          .set ('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role Admin should return array of availables zone', function(done){
      co(function *(){
        agent
          .get('/api/v1/zones')
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(hasSaneZoneObjects)
          .end(function(err, res){
            indexGlobalAPI.Topic_zone[0] = res.body[0].id;
            indexGlobalAPI.zoneIds[0] = res.body[0].id;
            if (err) throw err;
              done();
          });
      })()
    })

    it('Post should work for Role Admin-content:add_topic_any_zone test/v1/topics', function(done){
      indexGlobalAPI.topicPostInfo.zone_id = indexGlobalAPI.Topic_zone;
      agent
        .post('/api/v1/topics')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.topicPostInfo)
        .expect(200)
        .expect('Content-Type',/json/)
        .end(function(err, res){
            if(err) throw err;
          console.log("add_topic_any_zone:" + JSON.stringify(res.body));
         // indexGlobalAPI.TopicId = {"topic_id":"test123"};
          indexGlobalAPI.TopicId.topic_id = res.body.id;
          done();
        });
    })

    it('Post should work for Role Admin-content:add_topic_any_zone test/v1/topics', function(done){
      indexGlobalAPI.topicPostInfo.zone_id = indexGlobalAPI.Topic_zone;
      indexGlobalAPI.topicPostInfoToMoveStory.zone_id = indexGlobalAPI.Topic_zone;
      agent
        .post('/api/v1/topics')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.topicPostInfoToMoveStory)
        .expect(200)
        .expect('Content-Type',/json/)
        .end(function(err, res){
          if(err) throw err;
          console.log("add_topic_any_zone:" + JSON.stringify(res.body));
          // indexGlobalAPI.TopicId = {"topic_id":"test123"};
          indexGlobalAPI.topicPostInfoToMoveStory.topic_id = res.body.id;
          done();
        });
    })

    it('POST topic_groups/headlines should work Role Admin-user', function(done) {
      co(function *() {
        agent
          .post('/api/v1/topic_groups/headlines')
          .set('Host', 'test.localhost')
          .send({'topic_id': indexGlobalAPI.TopicId.topic_id})
          .expect(200)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    it('POST NEGATIVE topic_groups/headlines should work Role Admin-user', function(done) {
      co(function *() {
        agent
          .post('/api/v1/topic_groups/headlines')
          .set('Host', 'test.localhost')
          .send({'topic_id': 'deva-testb0a9cd4c7c87106etest'})
          .expect(404)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })
    
    it('GET topic_groups/headlines should work Role Admin-user', function(done) {
      co(function *() {
        agent
          .get('/api/v1/topic_groups/headlines')
          .expect(200)
          .expect(getTopicInGroupObject)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    it('DELETE topic_groups/headlines:topic_id should work Role Admin-user', function(done) {
      co(function *() {
        agent
          .delete('/api/v1/topic_groups/headlines/' + indexGlobalAPI.TopicId.topic_id)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    it ('Post should work for Role Admin-content:create_user_story test/v1/stories', function(done) {
      indexGlobalAPI.storyPostAdminInfo.topic_id = indexGlobalAPI.TopicId.topic_id;
      agent
        .post('/api/v1/stories')
        .send(indexGlobalAPI.storyPostAdminInfo)
        .expect(200)
        .expect('Content-Type',/json/)
        .end(function(err, res) {
          if(err) throw err;
          indexGlobalAPI.storyPostAdminInfo.story_id = res.body.id;
          indexGlobalAPI.storyAdvertorialType.associated_story_id = res.body.id;
          indexGlobalAPI.storyPostAdminInfo.rank = res.body.rank;
          done();
        });
    })

    it('Post should work for /user/:userid/stories listStoriesByAuthor', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.AdminUserID + '/stories')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(GetUserStory)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    it ('Post should work for Role Admin-content:create_any_info_story test/v1/stories', function(done) {
      indexGlobalAPI.storyInfoTopictype.topic_id = indexGlobalAPI.TopicId.topic_id;
      agent
        .post('/api/v1/stories')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.storyInfoTopictype)
        .expect(200)
        .expect('Content-Type',/json/)
        .expect(infoTypeTopicObject)
        .end(function(err, res){
          indexGlobalAPI.storyInfoTopictype.story_id = res.body.id;
            if(err) throw err; else done();
       });
    })  

    it('Voting story UP for Info story of Topic should return 400 NEGATIVE', function(done) {
      agent
        .put('/api/v1/stories/' + indexGlobalAPI.storyInfoTopictype.story_id + '/react?vote=up')
        .expect(400)
        .end(function(err, res) {
          if(err) throw err; else done();
        });
    });

    it('Voting story DOWN for Info story of Topic should return 400 NEGATIVE', function(done) {
      agent
        .put('/api/v1/stories/' + indexGlobalAPI.storyInfoTopictype.story_id + '/react?vote=down')
        .expect(400)
        .end(function(err, res) {
          if(err) throw err; else done();
        });
    });

    it('Post should work for /user/:userid/stories listStoriesByAuthor', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.AdminUserID + '/stories')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(GetInfoStory)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    it ('Post should work for Role Admin-content:create_story_adver_story test/v1/stories', function(done) {
      agent
        .post('/api/v1/stories')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.storyAdvertorialType)
        .expect(200)
        .expect('Content-Type',/json/)
        .expect(adverTypeStoryObject)
        .end(function(err, res){
          indexGlobalAPI.storyAdvertorialType.story_id = res.body.id;
            if(err) throw err; else done();
       });
    })

    it('Post should work for /user/:userid/stories listStoriesByAuthor', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.AdminUserID + '/stories')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(GetAdvertorialStory)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    it ('Post should work for Role Admin-content:create_page_adver_story test/v1/stories', function(done) {
      indexGlobalAPI.pageAdvertorialType.topic_id = indexGlobalAPI.TopicId.topic_id;
      agent
        .post('/api/v1/stories')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.pageAdvertorialType)
        .expect(200)
        .expect('Content-Type',/json/)
        .expect(adverTypePageStoryObject)
        .end(function(err, res){
          indexGlobalAPI.pageAdvertorialType.story_id = res.body.id;
            if(err) throw err; else done();
       });
    })
  
    it ('Role Admin-Delete Advertorial Page Story Post should work for test/v1/stories/:storyId', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.pageAdvertorialType.story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    }) 

    it ('Role Admin-Delete Advertorial Story Post should work for test/v1/stories/:storyId', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.storyAdvertorialType.associated_story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    }) 

    it ('Role Admin-Delete User Story Post should work for test/v1/stories/:storyId', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.storyAdvertorialType.story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    })
     
    // validation is no more exist on layout_type
    // it('PUT /api/v1/stories/<story_id> and should return 400', function(done){
    //   agent
    //     .put('/api/v1/stories/' + indexGlobalAPI.storyInfoTopictype.story_id)
    //     .send(indexGlobalAPI.storyPutLayoutInfo)
    //     .expect(400)
    //     .end(function(err, res){
    //       if(err) throw err; else done();
    //     });
    // });
    
    it ('Role Admin-Delete Story Post should work for test/v1/stories/:storyId', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.storyInfoTopictype.story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    })

    it ('Post should work for anonymous-content:create_user_story test/v1/stories', function(done) {
      indexGlobalAPI.storyPostInfo.topic_id = indexGlobalAPI.TopicId.topic_id;
      agent
        .post('/api/v1/stories')
        .send(indexGlobalAPI.anonymousNewStoryPostInfo)
        .expect(200)
        .expect('Content-Type',/json/)
       // .expect(anonymousStory)
        .end(function(err, res){
          if(err) throw err;
          indexGlobalAPI.anonymousNewStoryPostInfo.story_id = res.body.id;
          done();
        });
    })

    it('Post should work for document alreayd exist Role Admin-content:add_topic_any_zone test/v1/topics', function(done){
      indexGlobalAPI.topicPostInfo.zone_id = indexGlobalAPI.Topic_zone;
      agent
        .post('/api/v1/topics')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.topicPostInfo)
        .expect(400)
        .expect('Content-Type', /text\/plain/)
        .end(function(err, res){
          if (err) return err;
          done();
        });
    })

    /*it ('Role Admin-user:assign_role Post should work for  Assign role test/v1/users/:userId/assign/role', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/' + UserId[0] + '/assign/role')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.ManagingRoleInfo)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(hasSaneAssignrole)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })*/

    it ('Post should work for Role Admin-content:create_user_story test/v1/stories for moderation', function(done) {
      indexGlobalAPI.storyPostInfoWithDraft.topic_id = indexGlobalAPI.TopicId.topic_id;
      agent
        .post('/api/v1/stories')
        .send(indexGlobalAPI.storyPostInfoWithDraft)
        .set('Host', 'test.localhost')
        .expect(200)
        .expect('Content-Type',/json/)
        .expect (GetStoryStateInPost)
        .end(function(err, res){
          indexGlobalAPI.storyPostInfoWithDraft.story_id = res.body.id;
          if(err) throw err; else done();
        });
    })

    it('GET /api/v1/stories/<story_id> for moderation', function(done){
      co(function *()
      {
        console.log ("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
	      if (indexGlobalAPI.workerBoolean)  yield Promise.delay (30000); // This delay is added to check worker is working properly or not.
        agent
          .get ('/api/v1/stories/' + indexGlobalAPI.storyPostInfoWithDraft.story_id)
          .set('Host', 'test.localhost')
          .expect (200)
          .expect ('Content-Type', /json/)
          .expect (GetStoryStateInGet)
          .end (function (err, res) {
          if (err) throw err;
          done ();
        });
      })();
    });


  //TODO human moderation test cases

    it('PUT /api/v1/moderation/stories/<story_id> for moderation reject', function(done){
      agent
        .put ('/api/v1/moderation/stories/' + indexGlobalAPI.storyPostInfoWithDraft.story_id + '?action=reject')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.reasonToRejectOrApprove)
        .expect (200)
        .expect ('Content-Type', /json/)
        .expect (GetStoryStateInPutForReject)
        .end (function (err, res) {
        if (err) throw err;
        done ();
      });
    });

    it('GET /api/v1/stories/<story_id> after reject', function(done){
      co(function *()
      {
        console.log ("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
        // indexGlobalAPI.workerBoolean value will decide if we want to run worker Test cases or not.
        if (indexGlobalAPI.workerBoolean)  yield Promise.delay (30000); // This delay is added to check worker is working properly or not.
        agent
          .get ('/api/v1/stories/' + indexGlobalAPI.storyPostInfoWithDraft.story_id)
          .set('Host', 'test.localhost')
          .expect (200)
          .expect ('Content-Type', /json/)
          .expect (GetStoryStateInPutForReject)
          .end (function (err, res) {
          if (err) throw err;
          done ();
        });
      })();
    });

    it ('Role Admin-content:delete_own_user_story Post should work for test/v1/stories/:storyId for moderation', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.storyPostInfoWithDraft.story_id)
        .set('Host', 'test.localhost')
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    })

    it ('Role Admin-user:assign_role Post should work for  Assign role test/v1/users/:userId/assign/role with account_id', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/' + UserAccountId[0] + '/assign/role')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.ManagingRoleInfo)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(hasSaneAssignrole)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    /*it ('Post should work for Role Admin-user:reset_pw_without_old /user/changepassword with userId', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/'+ UserId[0] +'/changepassword')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.adminChangePasswordUserId)
          .expect(200)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })*/

    it ('Post should work for Role Admin-user:reset_pw_without_old /user/changepassword with account_id', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/'+ UserAccountId[0] +'/changepassword')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.adminChangePasswordAccountId)
          .expect(200)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role Admin should return zone object', function(done) {
      async.eachSeries(indexGlobalAPI.zoneIds, function(id, cb) {
        request(app)
          .get('/api/v1/zones/' + id)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(isSaneZoneObject)
          .end(function(err, res){
            if (err) cb(err); else cb();
          });
      }, function(err) {
            if (err) throw err; else done();
      });
    })

    it('Role Admin-content:edit_any_zone should work for PUT /api/v1/zones/* (existing) and return 200', function(done) {
      async.eachSeries(indexGlobalAPI.zoneIds, function(id, cb) {
        agent
          .put('/api/v1/zones/' + id)
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.zonePutInfo)
          .expect(200, done)
          .expect('Content-Type', /json/);
      })
    })

    it('Role Admin should work API /api/v1/zones/<zone_id>/topic_groups/<group_id>', function(done) {
      async.eachSeries(indexGlobalAPI.zoneIds, function(id) {
        async.eachSeries(indexGlobalAPI.topic_groups_id, function(oid){
            agent
              .get('/api/v1/zones/' + id + '/topic_groups/' + oid)
              .set('Host', 'test.localhost')
              .expect(200)
              .end(function(err, res){
                if(err) throw err; else done();
              });
          });
      });
    })

    it('Role Admin GET /api/v1/zones/* (non-existing) should return 404 error', function(done) {
      var wrongIds = ['pekka', '123*56745678?989fj929m-9wmfk9wekfm293fk23','¨', 'food&'];
      async.eachSeries(wrongIds, function(id, cb) {
        request(app)
          .get('/api/v1/zones/' + id)
          .set('Host', 'test.localhost')
          .expect(404)
          .end(function(err, res){
            if (err) cb(err); else cb();
          });
      }, function(err) {
           if (err) throw err; else done();
      });
    })
  // Rewards test Cases
    it('Post should work for add New Rewards POST Role Admin-user:add_reward test/v1/rewards', function(done){
      agent
        .post('/api/v1/rewards')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Host', 'test.localhost')
        .field('name', indexGlobalAPI.rewardInfo.name)
        .field('price', indexGlobalAPI.rewardInfo.price)
        .field('quantity', indexGlobalAPI.rewardInfo.quantity)
        .field('type', indexGlobalAPI.rewardInfo.type)
        .attach('icon', indexGlobalAPI.objectRewardPath)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(PostRewardsObject)
        .end(function(err, res) {
          indexGlobalAPI.addPayoutInfo.reward_id = [res.body.id];
          if (err) return err;
          done();
        });
    })

/*    it('Post should work for commit Credit Award POST Role Admin-user:add_user_credit test/users/:userid/credits', function(done){
      agent
        .post('/api/v1/users/' + UserId[0] + '/credits')
        .set('Host', 'test.localhost')
        .expect(200)
        .send(indexGlobalAPI.addCredit)
        .expect('Content-Type', /json/)
        .expect(PostCreditObject)
        .end(function(err, res) {
          indexGlobalAPI.creditId = [res.body.id];
          if (err) return err;
          done();
        });
    })*/

    it('Post should work for commit Credit Award POST Role Admin-user:add_user_credit test/users/:userid/credits with account_id', function(done){
      agent
        .post('/api/v1/users/' + UserAccountId[0] + '/credits')
        .set('Host', 'test.localhost')
        .expect(200)
        .send(indexGlobalAPI.addCredit)
        .expect('Content-Type', /json/)
        .expect(PostCreditObject)
        .end(function(err, res) {
          indexGlobalAPI.AccountcreditId = [res.body.id];
          if (err) return err;
          done();
        });
    })

    /*it('Post should work for commit Reward Purchase POST Role Admin-user:add_any_payout test/users/:userid/payouts', function(done){
      agent
        .post('/api/v1/users/' + UserId[0] + '/payouts')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.addPayoutInfo)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          indexGlobalAPI.payoutId = [res.body.id];
          if (err) return err;
          done();
        });
    })*/

    it('Post should work for commit Reward Purchase POST Role Admin-user:add_any_payout test/users/:userid/payouts with account_id', function(done){
      agent
        .post('/api/v1/users/' + UserAccountId[0] + '/payouts')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.addPayoutInfo)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          indexGlobalAPI.payoutAccountId = [res.body.id];
          if (err) return err;
          done();
        });
    })

    it('GET should work for get all rewards /rewards' , function (done) {
      agent
        .get('/api/v1/rewards')
        .set('Host', 'test.localhost')
        .expect(200)
        .end(function(err, res) {
          if(err) throw err;
          else {
            if(res.body.rewards && res.body.rewards.length > 1 ) {
              var rewards  = res.body.rewards;
              for (var i = rewards.length - 1; i >= 0; i--) {
                if(rewards[i].name.indexOf('Test Rewards') >= 0 ) {
                  indexGlobalAPI.paypal_reward_id = rewards[i].id;
                }
              };
              done();
            } else {
              throw new Error("Rewards are not saved properly");
            }
          }
        });
    })

    it('Post should work for commit Reward Purchase For PAYPAL Reward Role Admin-user:add_any_payout test/users/:userid/payouts with account_id', function(done){
      agent
        .post('/api/v1/users/' + indexGlobalAPI.AdminUserID + '/payouts')
        .set('Host', 'test.localhost')
        .send({'reward_id': indexGlobalAPI.paypal_reward_id, 'quantity': 1})
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          indexGlobalAPI.payoutAccountId = [res.body.id];
          if (err) return err;
          done();
      });
    })

    it('GET should work for /user Role Admin-user:get_any_payouts', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + UserId[0] + '/payouts' )
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return err;
              done();
          });
      })()
    })

    it('GET should work for /user Role Admin-user:get_any_payouts with account_id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + UserAccountId[0] + '/payouts' )
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    /*it('Post should work for  Role Admin-user:get_any_payouts test/v1/users/:userId/payouts/:payoutId', function(done) {
      co(function *() {
        console.log("payout Id .b. " + indexGlobalAPI.payoutId);
        agent
          .get('/api/v1/users/' + UserId[0] + '/payouts/' + indexGlobalAPI.payoutId)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(GetPayoutObject)
          .end(function(err, res) {
            if (err) return err;
              done();
          });
      })()
    })*/

    it('GET should work for  Role Admin-user:get_any_payouts test/v1/users/:userId/payouts/:payoutId with account_id', function(done) {
      co(function *() {
        console.log("payout Id .a. " + indexGlobalAPI.payoutAccountId);
        agent

          .get('/api/v1/users/' + UserAccountId[0] + '/payouts/' + indexGlobalAPI.payoutAccountId)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(GetPayoutObjectAccount)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    /*it('Delete should work for delete awarded credit Role Admin-user:remove_any_payout', function(done) {
      co(function *() {
        agent
          .delete('/api/v1/users/' + UserId[0] + '/payouts/' + indexGlobalAPI.creditId)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(DeleteCreditObject)
          .end(function(err, res) {
            if (err) return err;
              done();
          });
      })()
    })*/


    it('Delete should work for delete awarded credit Role Admin-user:remove_any_payout with account_id', function(done) {
      co(function *() {
        agent
          .delete('/api/v1/users/' + UserAccountId[0] + '/payouts/' + indexGlobalAPI.AccountcreditId)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(DeleteCreditObjectAccount)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })


    /*it('Delete should work for delete payout Role Admin-user:remove_any_payout', function(done) {
      co(function *() {
        agent
          .delete('/api/v1/users/' + UserId[0] + '/payouts/' + indexGlobalAPI.payoutId)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(DeletePayoutObject)
          .end(function(err, res) {
            if (err) return err;
              done();
          });
      })()
    })*/

    it('Delete should work for delete payout Role Admin-user:remove_any_payout with account_id', function(done) {
      co(function *() {
        agent
          .delete('/api/v1/users/' + UserAccountId[0] + '/payouts/' + indexGlobalAPI.payoutAccountId)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(DeletePayoutObjectAccount)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    it('POST should work for Add New Email Template /emails/templates', function(done){
      agent
        .post('/api/v1/emails/templates')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.addEmailTemplateInfo)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(NewEmailTemplateObject)
        .end(function(err, res) {
          indexGlobalAPI.template_id = res.body.id;
          if (err) return err;
          done();
        });
    })

    it('POST should work for NEGATIVE Add New Email Template /emails/templates', function(done){
      agent
        .post('/api/v1/emails/templates')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.addEmailTemplateInfo)
        .expect(400)
        .expect('Content-Type', /text\/plain/)
        .end(function(err, res) {
          if (err) return err;
          done();
        });
    })

    it('GET should work for Email Template /emails/templates', function(done) {
      co(function *() {
        agent
          .get('/api/v1/emails/templates')
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return err;
              done();
          });
      })()
    })

    it('GET should work for Get Email Template /emails/templates/:template_id', function(done){
      agent
        .get('/api/v1/emails/templates/' + indexGlobalAPI.template_id)
        .set('Host', 'test.localhost')
        .expect(200)
        .expect(getEmailTemplateObject)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return err;
            done();
        });
    })

    it('PUT should work for Update Email Template /emails/templates/:template_id', function(done){
      agent
        .put('/api/v1/emails/templates/' + indexGlobalAPI.template_id)
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.editEmailTemplateInfo)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(EditEmailTemplateObject)
        .end(function(err, res) {
          if (err) return err;
            indexGlobalAPI.sendEmailInfo.template_name = res.body.name;
            done();
        });
    })
    
    it('POST should work for Send email to multiple user using  /sendemails', function(done){
      agent
        .post('/api/v1/sendemails')
        .set('Host', 'test.localhost')
        .send(indexGlobalAPI.sendEmailInfo)
        .expect(200)
        .end(function(err, res) {
          if (err) return err;
          done();
        });
    })
    
    it('Delete should work for delete Email Template /emails/templates/:template_id', function(done) {
      co(function *() {
        agent
          .delete('/api/v1/emails/templates/' + indexGlobalAPI.template_id)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(DeleteEmailTemplateObject)
          .end(function(err, res) {
            if (err) return err;
              done();
          });
      })()
    })

    it('Post should work for /logout', function(done) {
      co(function *() {
        agent
          .post('/api/v1/logout')
          .set('Host', 'test.localhost')
          .end(function(err, res){
            agent.saveCookies(res);
            if (err) return err;
              done();
         });
      })()
    }) 
  })

function hasSaneRedirectURL(res) {
   console.log("hasSaneRedirectURL:" + JSON.stringify(res.headers.location));
   if(res.headers.location != loginInfo.success_redirect) throw new Error("Username and Password do not Match");
}

function isSaneZoneObject(res) {
   if (Array.isArray(res.body)) throw new Error("Is an array!");
   if (!valids.isAscii(res.body['id'])) throw new Error("Bad 'id' field");
   if (!valids.isInt(res.body['position'])) throw new Error("Bad 'position' field");
   if (!valids.isAscii(res.body['name'])) throw new Error("Bad 'name' field");
   for (var i = 0; i < res.body['topic_groups'].length; i++) {
       //Save zone topic_groups for later tests
       indexGlobalAPI.topic_groups_id.push(res.body['topic_groups'][i].id)
   };
}  

function hasSaneAssignrole(res) {
    if(!res.body instanceof Object) throw new Error("User res not an object!");
    if(res.body.role != indexGlobalAPI.ManagingRoleInfo.role_name ) throw new Error("The Assigned Role was different from the given one");
}

function hasSaneZoneObjects(res) {
   if (!Array.isArray(res.body)) throw new Error("Not an array!");
   if (res.body.length < 5) throw new Error("Less than five zones");
   for (var i=0;i<res.body.length;i++) {
       if (!valids.isAscii(res.body[i]['id'])) throw new Error("Bad 'id' field");
       if (!valids.isInt(res.body[i]['position'])) throw new Error("Bad 'position' field");
       if (!valids.isAscii(res.body[i]['name'])) throw new Error("Bad 'name' field");
       // Save zone id for later tests
       indexGlobalAPI.zoneIds.push(res.body[i]['id']);
   }
}

//topic test part
function PostTopicTest(res) {
   if(!res.body instanceof Object) throw new Error("Topic res not an object!");
   if(res.body.title != indexGlobalAPI.topicPostInfo.title) throw new Error("The title posted was different from the given one");
   if(res.body.author_name != indexGlobalAPI.topicPostInfo.author_name) throw new Error("The author_name was different as the posted one");
   indexGlobalAPI.testTopicId.push(res.body.id);
}

//Rewards test part
function PostRewardsObject(res) {
  if (!res.body instanceof Object) throw new Error("Reward res not an object!");
  if (res.body.name != indexGlobalAPI.rewardInfo.name) throw new Error("The Reward posted was different from the given one");
  if (res.body.price != indexGlobalAPI.rewardInfo.price) throw new Error("The price was different as the posted one");
}

function PostCreditObject(res) {
  if (!res.body instanceof Object) throw new Error("Credit res not an object!");
//  if (res.body.user_id != UserId[0]) throw new Error("The User was different from the given one");
  if (res.body.new_balance != indexGlobalAPI.addCredit.credits + res.body.starting_balance) throw new Error("The new_balance was different from the required one");
}

function GetPayoutObject(res) {
  if (!res.body instanceof Object) throw new Error("Payout res not an object!");
  if (res.body.id != indexGlobalAPI.payoutId[0]) throw new Error("The Payout Id was different from the given one");
}

function GetPayoutObjectAccount(res) {
  if (!res.body instanceof Object) throw new Error("Payout res not an object!");
  if (res.body.id != indexGlobalAPI.payoutAccountId[0]) throw new Error("The Payout Id was different from the given one");
}

/*function DeleteCreditObject(res) {
  if (!res.body instanceof Object) throw new Error("Credit Payout res not an object!");
  if (res.body.id != indexGlobalAPI.creditId[0]) throw new Error("The Credit payout Id was different from the given one");
}*/

function DeleteCreditObjectAccount(res) {
  if (!res.body instanceof Object) throw new Error("Credit Payout res not an object!");
  if (res.body.id != indexGlobalAPI.AccountcreditId[0]) throw new Error("The Credit payout Id was different from the given one");
}

function DeletePayoutObject(res) {
  if (!res.body instanceof Object) throw new Error("Payout res not an object!");
  if (res.body.id != indexGlobalAPI.payoutId[0]) throw new Error("The payout Id was different from the given one");
}

function DeletePayoutObjectAccount(res) {
  if (!res.body instanceof Object) throw new Error("Payout res not an object!");
  if (res.body.id != indexGlobalAPI.payoutAccountId[0]) throw new Error("The payout Id was different from the given one");
}

function infoTypeTopicObject(res) {
  if (!res.body instanceof Object) throw new Error("Story res not an object!");
  if (res.body.type != 'info_post') throw new Error("Story Type is not of info_post");
  if (res.body.rank != 100000) throw new Error(" Info story rank is not correct!");
  if (res.body.title != indexGlobalAPI.storyInfoTopictype.title) throw new Error("The author_name didn't match");
}

function adverTypeStoryObject(res) {
  if (!res.body instanceof Object) throw new Error("Story res not an object!");
  if (res.body.type != 'adver_post') throw new Error("Story Type is not of adver_post");
  if (res.body.rank != indexGlobalAPI.storyPostAdminInfo.rank) throw new Error("Advertorial story rank is not correct!");
  if (res.body.associated_story_id != indexGlobalAPI.storyPostAdminInfo.story_id) throw new Error("Advertorial story_id is not defined");
  if (res.body.title != indexGlobalAPI.storyAdvertorialType.title) throw new Error("The author_name didn't match");
}

function adverTypePageStoryObject(res) {
  if (!res.body instanceof Object) throw new Error("Story res not an object!");
  if (res.body.type != 'adver_post') throw new Error("Story Type is not of adver_post");
  if (res.body.rank != 99990) throw new Error(" Advertorial Page story rank is not correct!");
  if (res.body.title != indexGlobalAPI.pageAdvertorialType.title) throw new Error("The author_name didn't match");
}

function GetUserStory(res) {
  if (!res.body instanceof Object) throw new Error("Story res not an object!");
  if (res.body.stories[0].id != indexGlobalAPI.storyPostAdminInfo.story_id) throw new Error("The author UserId is not saved properly for User Story");
}

function GetInfoStory(res) {
  if (!res.body instanceof Object) throw new Error("Story res not an object!");
  if (!arrayHasKeyValue(res.body.stories,"id",indexGlobalAPI.storyPostAdminInfo.story_id)) {
    throw new Error("The author_UserId is not saved properly for User Story");
  }
  if (!arrayHasKeyValue(res.body.stories,"id",indexGlobalAPI.storyInfoTopictype.story_id)) {
    throw new Error("The author_UserId is not saved properly for Info Story");
  }    
}

function GetAdvertorialStory(res) {
  if (!res.body instanceof Object) throw new Error("Story res not an object!");
  if (!arrayHasKeyValue(res.body.stories,"id",indexGlobalAPI.storyPostAdminInfo.story_id)) {
    throw new Error("The author_UserId is not saved properly for User Story");
  }
  if (!arrayHasKeyValue(res.body.stories,"id",indexGlobalAPI.storyInfoTopictype.story_id)) {
    throw new Error("The author_UserId is not saved properly for Info Story");
  } 
  if (!arrayHasKeyValue(res.body.stories,"id",indexGlobalAPI.storyAdvertorialType.story_id)) {
    throw new Error("The author_UserId is not saved properly for Advertorial Story");
  }  
}

function getTopicInGroupObject(res) {
  if (!res.body instanceof Object) throw new Error("Topic res not an object!");
  if (res.body.topics[0].id != indexGlobalAPI.TopicId.topic_id) throw new Error("The topic_id is not saved properly for topicgroups");
}

function NewEmailTemplateObject(res) {
  if (!res.body instanceof Object) throw new Error("Email template res not an object!");
  if (res.body.name != indexGlobalAPI.addEmailTemplateInfo.name) throw new Error("The Email Template Name was different from the given one");
}

function getEmailTemplateObject(res) {
  if (!res.body instanceof Object) throw new Error("Email template res not an object!");
  if (res.body.id != indexGlobalAPI.template_id) throw new Error("The Email Template Name was different from the given one");
}

function EditEmailTemplateObject(res) {
  if (!res.body instanceof Object) throw new Error("Email template res not an object!");
  if (res.body.name != indexGlobalAPI.editEmailTemplateInfo.name) throw new Error("The Email Template 'Name' was different from the given one");
  if (res.body.to != indexGlobalAPI.editEmailTemplateInfo.to) throw new Error("The Email Template 'To' was different from the given one");
}

function DeleteEmailTemplateObject(res) {
  if (!res.body instanceof Object) throw new Error("Email template res not an object!");
  if (res.body.id != indexGlobalAPI.template_id) throw new Error("The Email Template Name was different from the given one");
}

function arrayHasKeyValue(arr,key,value) { //Helper function to check if key value exist in array
  for(var i = 0 ;i <arr.length ; i++) {
    if(arr[i][key] === value) {
      return true;
    }
  }
  return false;
}

function GetStoryStateInPost(res) {
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'public') throw new Error("The story status in not public");
}

function GetStoryStateInGet(res) {
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'public') throw new Error("The story status in not public");
}

function GetStoryStateInPutForReject(res) {
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'draft') throw new Error("The story status in not submitted");
}

function GetStoryStateInApprove(res) {
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'publish') throw new Error("The story status in not submitted");
}

function createBlackList(res){
  if(!res.body instanceof Object) throw new Error("Blacklist res not an object!");
  if(!res.body.entry) throw new Error("The entryId for the blacklist is not created");
}

function getBlackList(res){
  if(!res.body instanceof Object) throw new Error("Blacklist res not an object!");
  if(!res.body.list.entry) throw new Error("The entryId for the blacklist is not in response");
}