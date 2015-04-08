var web_api = require('../../../web_api/server')
   , request = require('supertest')
   , co = require('co')
   , async = require('async')
   , valids = require('validator')
   , agent = request.agent('http://local.zmc.io:9070')
   , indexGlobalAPI = require('./index_global.js')
   , Promise = require('bluebird')
   , UserAdminAPI = require('../../../lib/user/user_admin.js')
   , config = require('../../../config')
   , LogsAPI = require('../../../lib/logs/api.js')


  describe ('contributor Role Test Cases', function() {

    it('Role contributor-user Post should work for /login ', function(done) {
      co(function *() {
        agent
          .post('/api/v1/login')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send(indexGlobalAPI.signUpInfo)
          .expect(302)
          .expect('Content-Type', /text\/html/)
        //  .expect(hasSaneRedirectURL)
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
            indexGlobalAPI.View_profile_UserID = res.body.id;
            indexGlobalAPI.View_profile_UserAccountID = res.body.account_id;
             if (err) return err;
             done();
          });
      })()
    })

    it('Post should work for /logout', function(done) {
      co(function *() {
        agent
          .post('/api/v1/logout')
          .end(function(err, res){
            agent.saveCookies(res);
            if (err) return err;
              done();
         });
      })()
    })

    it('Role contributor-user Post should work for /login Admin', function(done) {
      co(function *() {
        agent
          .post('/api/v1/login')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send(indexGlobalAPI.loginAdminInfo)
          .expect(302)
          .expect('Content-Type', /text\/html/)
        //  .expect(hasSaneRedirectURL)
          .end(function(err, res){
            agent.saveCookies(res)
            if (err) return err;
              done();
          });
      })()
    })

     it('Post should work for /user Role contributor-user:view_any_profile', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.View_profile_UserID)
          .set('Host', 'test.localhost')
          .end(function(err, res){
            indexGlobalAPI.UserId = [res.body.id];
            indexGlobalAPI.UserAccountId = [res.body.account_id];
            if (err) return err;
              done();
          });
      })()
    })

    it('Post should work for /user Role contributor-user:view_any_profile with account_id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.View_profile_UserAccountID)
          .set('Host', 'test.localhost')
          .end(function(err, res){
            indexGlobalAPI.UserId = [res.body.id];
            indexGlobalAPI.UserAccountId = [res.body.account_id];
            if (err) return err;
            done();
          });
      })()
    })

    it('Post should work for /user Role Admin-user:view_own_profile', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/me')
          .end(function(err, res){
            indexGlobalAPI.FollowingId.following_userid = res.body.id;
            if (err) return err;
              done();
          });
      })()
    })

    it('Post should work for /user Role Admin-user:view_own_profile with account_id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/me')
          .end(function(err, res){
            indexGlobalAPI.FollowingAccountId.following_userid = res.body.account_id;
            if (err) return err;
            done();
          });
      })()
    })

    /*it ('Role contributor-user:assign_role Post should work for  Assign role test/v1/users/:userId/assign/role', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/' + indexGlobalAPI.UserId[0] + '/assign/role')
          .send(indexGlobalAPI.contributorRoleInfo)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })*/

    it ('Role contributor-user:assign_role Post should work for  Assign role test/v1/users/:userId/assign/role with account_id', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] + '/assign/role')
          .send(indexGlobalAPI.contributorRoleInfo)
          .set('Host', 'test.localhost')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Post should work for /logout', function(done) {
      co(function *() {
        agent
          .post('/api/v1/logout')
          .end(function(err, res){
            agent.saveCookies(res);
            if (err) return err;
              done();
         });
      })()
    })

    it('Role contributor-user Post should work for /login ', function(done) {
      co(function *() {
        agent
          .post('/api/v1/login')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send(indexGlobalAPI.signUpInfo)
          .expect(302)
          .expect('Content-Type', /text\/html/)
        //  .expect(hasSaneRedirectURL)
          .end(function(err, res){
            agent.saveCookies(res)
            if (err) return err;
              done();
          });
      })()
    })

    /*it('Role contributor should be able to add Email', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/' + indexGlobalAPI.UserId[0] + '/emails')
          .send(indexGlobalAPI.newEmail)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            console.log("Add email res.body.emails:" + JSON.stringify(res.body.emails[0].verification_code));
            if (err) return err;
            for(var i = 0 ; i < res.body.emails.length ; i++){
              if(indexGlobalAPI.newEmail.email == res.body.emails[i].email){
                indexGlobalAPI.verificationcode = res.body.emails[i].verification_code;
                indexGlobalAPI.emailid = res.body.emails[i].email;
              }
            }
            done();
          });
      })()
    })

    it('Role contributor should be able Verify User Email', function(done){
      co(function *() {
        agent
          .post('/api/v1/email/' + indexGlobalAPI.emailid + '/verificationcode/' + indexGlobalAPI.verificationcode)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })*/

    it('Role contributor should be able to add Email with account_id', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] + '/emails')
          .send(indexGlobalAPI.newEmailWithAccountid)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            console.log("Add email res.body.emails:" + JSON.stringify(res.body.emails[0].verification_code));
            if (err) return err;
            for(var i = 0 ; i < res.body.emails.length ; i++){
              if(indexGlobalAPI.newEmailWithAccountid.email == res.body.emails[i].email){
                indexGlobalAPI.verificationcode = res.body.emails[i].verification_code;
                indexGlobalAPI.emailid = res.body.emails[i].email;
                indexGlobalAPI.signUpInfo.username = res.body.emails[i].email;//new username will be current primary_email;
              }
            }
            done();
          });
      })()
    })

    it('Role contributor should be able Verify User Email', function(done){
      co(function *() {
        agent
          .post('/api/v1/email/' + indexGlobalAPI.emailid + '/verificationcode/' + indexGlobalAPI.verificationcode)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    /*it('Role contributor should be able to update user fields', function(done) {
      co(function *() {
        agent
          .put('/api/v1/users/' + indexGlobalAPI.UserId[0])
          .send(indexGlobalAPI.userFields)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })*/

    it('Role contributor should be able to update user fields with account_id', function(done) {
      co(function *() {
        agent
          .put('/api/v1/users/' + indexGlobalAPI.UserAccountId[0])
          .send(indexGlobalAPI.userFields)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    /*it('Role contributor should be able to add Email to set primary email', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/' + indexGlobalAPI.UserId[0] + '/emails')
          .send(indexGlobalAPI.updateEmail)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })*/

    it('Role contributor should be able to add Email to set primary email with account_id', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] + '/emails')
          .send(indexGlobalAPI.updateEmailWithAccountId)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role contributor should be able to update user primary email with accountid', function(done) {
      co(function *() {
        agent
          .put('/api/v1/users/' + indexGlobalAPI.UserAccountId[0])
          .send(indexGlobalAPI.updatePrimaryEmailWithAccountid)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    /*it('Role contributor should be able to update user primary email', function(done) {
      co(function *() {
        agent
          .put('/api/v1/users/' + indexGlobalAPI.UserId[0])
          .send(indexGlobalAPI.updatePrimaryEmailWithAccountid)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role contributor should be able to remove non Primary Email', function(done) {
      co(function *() {
        agent
          .delete('/api/v1/users/' + indexGlobalAPI.UserId[0] + '/emails/' + indexGlobalAPI.updateEmail.email)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })*/

    it('Role contributor should be able to remove non Primary Email with account_id', function(done) {
      co(function *() {
        agent
          .delete('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] + '/emails/' + indexGlobalAPI.updateEmailWithAccountId.email)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role contributor GET should work for /organisations/:accountId ', function(done) {
      co(function *() {
        agent
          .get('/api/v1/organizations/'+indexGlobalAPI.accountId)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role contributor GET Topic /api/v1/topics/<topic_id>', function(done){
      co(function *() {
        agent
         .get('/api/v1/topics/' + indexGlobalAPI.TopicId.topic_id)
         .expect(200)
         .expect('Content-Type', /json/)
         .end(function(err, res){
            if (err) return err;
            done();
         });
       })()
    });

    it('Role contributor GET Topic /api/v1/topics/<topic_id> should return the 404 error', function(done){
      co(function *() {
      var negWrongTopicId = 'deva-53b54898c15851976rfd5ydf';
        agent
          .get('/api/v1/topics/' + negWrongTopicId)
          .expect(404)
          .end(function(err, res){
            if(err) throw err; else done();
          });
      })()
    });


    /*it('Post should work forRole contributor-user:follow_topic test/v1/users/:userid/following/topics', function(done){
      async.eachSeries(indexGlobalAPI.UserId, function(id, cb) {
        agent
          .post('/api/v1/users/' + indexGlobalAPI.UserId[0] +'/following/topics')
          .send(indexGlobalAPI.TopicId)
          .expect(200)
          .expect('Content-Type', /application\/json/)
         // .expect(hasSaneTopic)
          .end(function(err, res){
            if (err) cb(err); else cb();
          });
      }, function(err) {
      if (err) throw err; else done();
       });
    })



    it('should work for Role contributor-user:get_user_topics and return the Topic Followed By User /users/:userId/following/Topics', function(done) {
      async.eachSeries(indexGlobalAPI.UserId, function(id, cb) {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.UserId[0] + '/following/topics')
          .expect(200)
          .expect('Content-Type', /application\/json/)
         // .expect(topicIdInFollowedTopics)
          .end(function(err, res) {
            if (err) cb(err); else cb();
          });
      }, function(err) {
           if (err) throw err; else done();
      });
    })



    it ('Post should work for Role contributor-user:is_following_topic /users/:userId/is_following_topic/:topicId', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/'+ indexGlobalAPI.UserId[0] +'/is_following_topic/' + indexGlobalAPI.TopicId.topic_id)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })



    it('Post should work for Role contributor-user:unfollow_topic test/v1/users/:userid/unfollow/topics', function(done) {
      async.eachSeries(indexGlobalAPI.UserId, function(id, cb) {
        agent
          .delete('/api/v1/users/' + indexGlobalAPI.UserId[0] +'/following/topics/'+indexGlobalAPI.TopicId.topic_id)
          .expect(200)
          .expect('Content-Type', /application\/json/)
         // .expect(hasSaneTopic)
          .end(function(err, res) {
            if (err) cb(err); else cb();
          });
      }, function(err) {
           if (err) throw err; else done();
      });
    })*/

    it('Post should work forRole contributor-user:follow_topic test/v1/users/:userid/following/topics with account_id', function(done){
      async.eachSeries(indexGlobalAPI.UserAccountId, function(id, cb) {
        agent
          .post('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] +'/following/topics')
          .send(indexGlobalAPI.TopicId)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          // .expect(hasSaneTopic)
          .end(function(err, res){
            if (err) cb(err); else {
              cb();
            }
          });
      }, function(err) {
        if (err) throw err; else done();
      });
    })

    it('should work for Role contributor-user:get_user_topics and return the Topic Followed By User /users/:userId/following/Topics with account_id', function(done) {
      async.eachSeries(indexGlobalAPI.UserAccountId, function(id, cb) {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] + '/following/topics')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          // .expect(topicIdInFollowedTopics)
          .end(function(err, res) {
            if (err) cb(err); else cb();
          });
      }, function(err) {
        if (err) throw err; else done();
      });
    })

    it ('Post should work for Role contributor-user:is_following_topic /users/:userId/is_following_topic/:topicId with account_id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/'+ indexGlobalAPI.UserAccountId[0] +'/is_following_topic/' + indexGlobalAPI.TopicId.topic_id)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Post should work for Role contributor-user:unfollow_topic test/v1/users/:userid/unfollow/topics with account_id', function(done) {
      async.eachSeries(indexGlobalAPI.UserAccountId, function(id, cb) {
        agent
          .delete('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] +'/following/topics/'+indexGlobalAPI.TopicId.topic_id)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          // .expect(hasSaneTopic)
          .end(function(err, res) {
            if (err) cb(err); else cb();
          });
      }, function(err) {
        if (err) throw err; else done();
      });
    })

    it ('Post should work for Role contributor-content:create_user_story test/v1/stories for moderation', function(done) {
      indexGlobalAPI.storyPostInfo.topic_id = indexGlobalAPI.TopicId.topic_id;
      agent
        .post('/api/v1/stories')
        .send(indexGlobalAPI.storyModerationPostInfo)
        .expect(200)
        .expect('Content-Type',/json/)
        .expect (GetStoryStateInPost)  
        .end(function(err, res){
          if(err) throw err;
          indexGlobalAPI.moderationStoryId.story_id = res.body.id;
          done();
       });
    })

    it('GET /api/v1/stories/<story_id> after create user story for moderation', function(done){
      co(function *()
      {
        console.log ("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
        // indexGlobalAPI.workerBoolean value will decide if we want to run worker Test cases or not.
        if (indexGlobalAPI.workerBoolean)  yield Promise.delay (30000); // This delay is added to check worker is working properly or not.
        agent
          .get ('/api/v1/stories/' + indexGlobalAPI.moderationStoryId.story_id)
          .expect (200)
          .expect ('Content-Type', /json/)
          .expect (GetStoryTestModeration)
          .end (function (err, res) {
          if (err) throw err;
          done ();
        });
      })();
    });

    it ('Role contributor-content:delete_own_user_story Post should work for test/v1/stories/:storyId for moderation', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.moderationStoryId.story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .expect(getStoryStateInDelete)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    })


    it ('Post should work for Role contributor-content:create_user_story test/v1/stories', function(done) {
      indexGlobalAPI.storyPostInfo.topic_id = indexGlobalAPI.TopicId.topic_id;
      agent
        .post('/api/v1/stories')
        .send(indexGlobalAPI.storyPostInfo)
        .expect(200)
        .expect('Content-Type',/json/)
        .expect (GetStoryStateInPost)  
        .end(function(err, res){
          indexGlobalAPI.StoryId.story_id = res.body.id;
            if(err) throw err; else done();
       });
    })

    it('GET /api/v1/stories/<story_id> after create user story', function(done){
      co(function *()
      {
        console.log ("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
        // indexGlobalAPI.workerBoolean value will decide if we want to run worker Test cases or not.
        if (indexGlobalAPI.workerBoolean)  yield Promise.delay (30000); // This delay is added to check worker is working properly or not.
        agent
          .get ('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id)
          .expect (200)
          .expect ('Content-Type', /json/)
          .expect (GetStoryTest)
          .expect (GetStoryStateInGet)
          .end (function (err, res) {
          if (err) throw err;
          done ();
        });
      })();
    });

    it ('Post should work for Role contributor-content:create_user_story test/v1/stories', function(done) {
      indexGlobalAPI.storyPostInfoWithDraft.topic_id = indexGlobalAPI.TopicId.topic_id;
      agent
        .post('/api/v1/stories?action=save_as_draft')
        .send(indexGlobalAPI.storyPostInfoWithDraft)
        .expect(200)
        .expect('Content-Type',/json/)
        .expect (GetStoryStateInPostWithDraft)  
        .end(function(err, res){
          indexGlobalAPI.storyPostInfoWithDraft.story_id = res.body.id;
          if(err) throw err; else done();
        });
    })

    it('GET /api/v1/stories/<story_id> after create user story for draft', function(done){
      co(function *()
      {
        console.log ("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
        // indexGlobalAPI.workerBoolean value will decide if we want to run worker Test cases or not.
        if (indexGlobalAPI.workerBoolean)  yield Promise.delay (30000); // This delay is added to check worker is working properly or not.
        agent
          .get ('/api/v1/stories/' + indexGlobalAPI.storyPostInfoWithDraft.story_id)
          .expect (200)
          .expect ('Content-Type', /json/)
          .expect (GetStoryStateInGetWithDraft)
          .end (function (err, res) {
          if (err) throw err;
          done ();
        });
      })();
    });

    it('PUT /api/v1/stories/<story_id> and should return 200 for draft to publish a user story', function(done){
      agent
        .put ('/api/v1/stories/' + indexGlobalAPI.storyPostInfoWithDraft.story_id)
        .send (indexGlobalAPI.storyPutInfoWithPublish)
        .expect (200)
        .expect ('Content-Type', /json/)
        .expect (GetStoryStateInPut)
        .end (function (err, res) {
        if (err) throw err; else done ();
      });
    });

    it('GET /api/v1/stories/<story_id> after create user story for draft to publish', function(done){
      co(function *()
      {
        console.log ("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
        // indexGlobalAPI.workerBoolean value will decide if we want to run worker Test cases or not.

        if (indexGlobalAPI.workerBoolean)  yield Promise.delay (30000); // This delay is added to check worker is working properly or not.
        agent
          .get ('/api/v1/stories/' + indexGlobalAPI.storyPostInfoWithDraft.story_id)
          .expect (200)
          .expect ('Content-Type', /json/)
          .expect (GetStoryStateInGet)
          .end (function (err, res) {
          if (err) throw err;
          done ();
        });
      })();
    });

    it ('Role contributor-content:delete_own_user_story Post should work for test/v1/stories/:storyId', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.storyPostInfoWithDraft.story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .expect(getStoryStateInDelete)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    })

    it ('Post should work for Role contributor-content:create_own_info_story test/v1/stories', function(done) {
      agent
        .post('/api/v1/stories')
        .send(indexGlobalAPI.storyInfoType)
        .expect(200)
        .expect('Content-Type',/json/)
        .expect(infoTypeStoryObject)
        .end(function(err, res){
          indexGlobalAPI.storyInfoType.story_id = res.body.id;
            if(err) throw err; else done();
       });
    })

    it ('Post should work for Role anonymous-content:create_user_story test/v1/stories', function(done) {
      indexGlobalAPI.storyPostInfo.topic_id = indexGlobalAPI.TopicId.topic_id;
      agent
        .post('/api/v1/stories')
        .send(indexGlobalAPI.anonymousStoryPostInfo)
        .expect(200)
        .expect('Content-Type',/json/)
        .expect(anonymousStory)
        .end(function(err, res){
          if(err) throw err;
          indexGlobalAPI.anonymousStoryPostInfo.story_id = res.body.id;
          done();
        });
    })

  // Test anonymous Story on User profile
    it('Post should work for Test anonymousStory in  own User Profile /user/me/stories listStoriesByAuthor', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/me/stories')
          .expect(200)
          .expect(getAnonymousOwnStory)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    it('Post should work for Test anonymousStory /user/:userid/stories listStoriesByAuthor with User-id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.AdminUserID + '/stories')
          .expect(200)
          .expect(getAnonymousOtherStory)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    it('should return 400', function(done){
      var negWrongTopicId = {'topic_id':'fdsafsdafasf', 'title':'new post'}
      agent
        .post('/api/v1/stories')
        .send(negWrongTopicId)
        .expect(400)
        .end(function(err, res){
          if (err) throw err;
            done();
        });
    });

    it('should return 400', function(done){
      var negEmptyTitle = {'topic_id': indexGlobalAPI.storyPostInfo.topic_id, 'title':' '};
      indexGlobalAPI.storyPostInfo.topic_id = indexGlobalAPI.TopicId.topic_id;
        agent
          .post('/api/v1/stories')
          .send(negEmptyTitle)
          .expect(400)
          .end(function(err, res){
            if (err) throw err;
              done();
          });
    });

    it('Voting story once should return OK', function(done){
      agent
        .put('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id + '/react?vote=up')
        .expect(200)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });


    it('GET /api/v1/stories/<story_id> should return the 400 error', function(done){
      var negWrongStoryId = 'dsjfojweofjiewjf';
      agent
        .get('/api/v1/stories/' + negWrongStoryId)
        .expect(400)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });

    it('PUT /api/v1/stories/<story_id> and should return 200 and equal to the updated data', function(done){
      agent
        .put ('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id + '?action=save_as_draft')
        .send (indexGlobalAPI.storyPutInfo)//send save_as_draft
        .expect (200)
        .expect ('Content-Type', /json/)
        .expect (PutStoryTest)//expect story.status = draft
        .expect (GetStoryStateInPutWithDraft)//expect story.status = draft
        .end (function (err, res) {
          if (err) throw err; else done ();
        });
    });

    it('GET /api/v1/stories/<story_id> for user story after put with save_as_draft', function(done){
      co(function *()
      {
        console.log ("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
        // indexGlobalAPI.workerBoolean value will decide if we want to run worker Test cases or not.
        if (indexGlobalAPI.workerBoolean)  yield Promise.delay (30000); // This delay is added to check worker is working properly or not.
        agent
          .get ('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id)
          .expect (200)
          .expect ('Content-Type', /json/)
          .expect (GetStoryStateInGetWithDraft)
          .end (function (err, res) {
          if (err) throw err;
          done ();
        });
      })()
    });

    it('PUT /api/v1/stories/<story_id> and should return 200 and equal to the updated data', function(done){
      co(function *()
      {
        console.log ("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
        // indexGlobalAPI.workerBoolean value will decide if we want to run worker Test cases or not.

        if (indexGlobalAPI.workerBoolean)  yield Promise.delay (30000); // This delay is added to check worker is working properly or not.
        agent
          .put ('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id)
          .send (indexGlobalAPI.storyPutInfo)
          .expect (200)
          .expect ('Content-Type', /json/)
          .expect (PutStoryTest)//expect story.status = submitted
          .expect (GetStoryStateInPut)//expect story.status = submitted
          .end (function (err, res) {
          if (err) throw err; else done ();
        });
      })()
    });

    it('GET /api/v1/stories/<story_id> with put without save_as_draft', function(done){
      co(function *()
      {
        console.log ("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
        // indexGlobalAPI.workerBoolean value will decide if we want to run worker Test cases or not.

        if (indexGlobalAPI.workerBoolean)  yield Promise.delay (30000); // This delay is added to check worker is working properly or not.
        agent
          .get ('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id)
          .expect (200)
          .expect ('Content-Type', /json/)
          .expect (GetStoryStateInGet)
          .end (function (err, res) {
          if (err) throw err;
          done ();
        });
      })();
    });

    // validation is no more exist on layout_type
    // it('PUT /api/v1/stories/<story_id> and should return 400', function(done){
    //   agent
    //     .put('/api/v1/stories/' + indexGlobalAPI.storyInfoType.story_id)
    //     .send(indexGlobalAPI.storyPutLayoutInfo)
    //     .expect(400)
    //     .end(function(err, res){
    //       if(err) throw err; else done();
    //     });
    // });
  
    it('PUT /api/v1/movestories/<story_id>', function(done){
      agent
        .put('/api/v1/movestories/' + indexGlobalAPI.StoryId.story_id)
        .send(indexGlobalAPI.topicPostInfoToMoveStory)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res){
          if(err) throw err; else done();
       });
    });

    it('Voting story for Info story for User should return 400 NEGATIVE', function(done){
      agent
        .put('/api/v1/stories/' + indexGlobalAPI.storyInfoType.story_id + '/react?vote=up')
        .expect(400)
        .end(function(err, res){
          indexGlobalAPI.timeout = config.webshot.timeout;
          config.webshot.timeout = 30000;
          if(err) throw err; else done();
        });
    });


    it('GET /api/v1/assets/images for successfully image upload', function(done){
      agent
        .get('/api/v1/assets/images?capture_url=' + indexGlobalAPI.weblink)
        .expect(200)
        .end(function(err, res){
          config.webshot.timeout = indexGlobalAPI.timeout;
          if (err) throw err;
          done();
        });
    });

    it('GET /api/v1/assets/images for wrong url', function(done){
      agent
        .get('/api/v1/assets/images?capture_url=' + indexGlobalAPI.wrongWeblink)
        .expect(404)
        .end(function(err, res){
          config.webshot.timeout = 1;
          if (err) throw err;
          done();
        });
    });

    it('GET /api/v1/assets/images for timeout', function(done){
      agent
        .get('/api/v1/assets/images?capture_url=' + indexGlobalAPI.weblink)
        .expect(408)
        .end(function(err, res){
          config.webshot.timeout = indexGlobalAPI.timeout;
          if (err) throw err;
          done();
        });
    });

    it('POST /api/v1/stories/<story_id>/objects and should return 200', function(done){
      agent
        .post('/api/v1/stories/'+ indexGlobalAPI.StoryId.story_id +'/objects')
        .attach('image',indexGlobalAPI.objectImagePath)
        .field('type', indexGlobalAPI.objectPostInfo.type)
        .field('caption', indexGlobalAPI.objectPostInfo.caption)
        .field('position', indexGlobalAPI.objectPostInfo.position)
        .expect(200)
        .expect(PostObjectTest)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });

    it('PUT /api/v1/stories/<story_id>/objects/<object_id> and return the same updated object parameters', function(done){
      async.eachSeries(indexGlobalAPI.testObjectId, function(oid){
        agent
          .put('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id + '/objects/' + oid)
          .attach('image', indexGlobalAPI.objectUpdatedImagePath)
          .field('caption', indexGlobalAPI.objectPutInfo.caption)
          .expect(200)
          .end(function(err, res){
            if(err) throw err; else done();
          });
      });
    });

    it('PUT /api/v1/stories/<story_id>/objects/<object_id> and return the same updated object parameters', function(done){
      async.eachSeries(indexGlobalAPI.testObjectId, function(oid){
        agent
          .put('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id + '/objects/' + oid)
          .send(indexGlobalAPI.objectPutInfo)
          .expect(200)
          .end(function(err, res){
            if(err) throw err; else done();
          });
      });
    });
  /*
    it('DEL /api/v1/stories/<story_id>/objects/<object_id> and delete the object item', function(done){
      async.eachSeries(indexGlobalAPI.testObjectId, function(oid){
        agent
          .delete('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id + '/objects/' + oid)
          .expect(200)
          .end(function(err, res){
            if(err) throw err; else done();
          });
      });
    });
 */
    it('POST /api/v1/stories/<story_id>/comments and add the comments and return 200', function(done){
        agent
          .post('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id  + '/comments')
          .send(indexGlobalAPI.commentPostInfo)
          .expect(200)
          .expect(PostCommentTest)
          .end(function(err, res){
            if(err) throw err;
            indexGlobalAPI.testCommentId = res.body.id;
            done();
          });
    });

    it('POST /api/v1/stories/<story_id>/comments and add the anonymous comments and return 200', function(done){
      agent
        .post('/api/v1/stories/' + indexGlobalAPI.anonymousStoryPostInfo.story_id  + '/comments')
        .send(indexGlobalAPI.anonymousCommentPostInfo)
        .expect(200)
        .expect(anonymousComment)
        .end(function(err, res){
          if(err) throw err;
          indexGlobalAPI.anonymousTestCommentId = res.body.id;
          done();
        });
    });

    it('GET /api/v1/stories/<story_id>/comments and should get one comment', function(done){
      agent
        .get('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id  + '/comments')
        .send(indexGlobalAPI.commentPostInfo)
        .expect(200)
        .expect(ValidComments)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });

    it('POST /api/v1/stories/<story_id>/comments "NEGATIVE" should return 400', function(done){
      var negCommentInfo = {"comment":"  ", "author_name":"  "};
      agent
        .post('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id  + '/comments')
        .send(negCommentInfo)
        .expect(400)
        .end(function(err, res){
           if(err) throw err; else done();
        });
    });

    it('PUT /api/v1/stories/<story_id>/comments and add the comments and return 200', function(done){
      agent
        .put('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id  + '/comments/' + indexGlobalAPI.testCommentId)
        .send(indexGlobalAPI.commentPutInfo)
        .expect(200)
        .expect(PostCommentUpdateTest)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });

    it('PUT /api/v1/stories/<story_id>/comments/<comment_id>/react?vote=up and should add the vote data', function(done){
      agent
        .put('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id + '/comments/' + indexGlobalAPI.testCommentId + '/react?vote=up')
        .expect(200)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });

    it('PUT /api/v1/stories/<story_id>/comments/<comment_id>/react?vote=down and should add the vote data', function(done){
      agent
        .put('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id + '/comments/' + indexGlobalAPI.testCommentId + '/react?vote=down')
        .expect(200)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });

    it('GET /api/v1/topics/<topic_id>/stories and return the stories object under one topic', function(done){
      co(function *() {
        agent
          .get('/api/v1/topics/' + indexGlobalAPI.TopicId.topic_id + '/stories')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if(err) throw err; else done();
          });
      })()
    });

    it('POST /api/v1/comments/<commentId>/replies a add the comments and return 200', function(done){
      agent
        .post('/api/v1/comments/' + indexGlobalAPI.testCommentId + '/replies')
        .send(indexGlobalAPI.commentReplyInfo)
        .expect(200)
        .expect(PostReplyTest)
        .end(function(err, res){
          indexGlobalAPI.testReplyId = res.body.id;
          if(err) throw err; else done();
        });
    });

    it('POST /api/v1/comments/<commentId>/replies a add the anonymous reply comments and return 200', function(done){
      agent
        .post('/api/v1/comments/' + indexGlobalAPI.anonymousTestCommentId + '/replies')
        .send(indexGlobalAPI.anonymousCommentReplyInfo)
        .expect(200)
        .expect(anonymousCommentReply)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });
  
    it('GET /api/v1/comments/<commentId>/replies and should get reply', function(done){
      agent
        .get('/api/v1/comments/' + indexGlobalAPI.testCommentId + '/replies' )
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect(ValidRepliesOnComment)
        .end(function(err, res){
        if(err) throw err; else done();
      });
    }); 

    it('PUT /api/v1/comments/<commentId>/replies/<replyId> and add the comments and return 200', function(done){
      agent
        .put('/api/v1/comments/' + indexGlobalAPI.testCommentId + '/replies/' + indexGlobalAPI.testReplyId)
        .send(indexGlobalAPI.commentEditReplyInfo)
        .expect(200)
        .expect(PostUpdateReplyTest)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });
  /*
    it('DELETE /api/v1/comments/<commentId>/replies/<replyId>', function(done){
      agent
        .delete('/api/v1/comments/' + indexGlobalAPI.testCommentId + '/replies/' + indexGlobalAPI.testReplyId)
        .expect(200)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });

    it('DELETE /api/v1/stories/:storyId/comments/:commentId', function(done){
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id  + '/comments/' + indexGlobalAPI.testCommentId)
        .expect(200)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });
  */
    /*it ('Post should work for Role contributor-user:view_follow_story test/v1/users/:userid/follow/stories', function(done) {
      async.eachSeries(indexGlobalAPI.UserId, function(id, cb) {
        agent
          .post('/api/v1/users/' + indexGlobalAPI.UserId[0] +'/following/stories')
          .send(indexGlobalAPI.StoryId)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(hasSaneStory)
          .end(function(err, res){
            if (err) cb(err); else {
              cb();
            }
          });
      }, function(err) {
           if (err) throw err; else done();
      });
    })

    it ('Role contributor-user:get_user_stories should return the Story Followed By User /users/:userId/following/stories', function(done) {
      async.eachSeries(indexGlobalAPI.UserId, function(id, cb) {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.UserId[0] + '/following/stories')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(storyIdInFollowedStory)
          .end(function(err, res){
            if (err) cb(err); else cb();
          });
      }, function(err) {
           if (err) throw err; else done();
      });
    })

    it ('Post should work for Role contributor-user:is_following_story /users/:userId/is_following_story/:storyId', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/'+ indexGlobalAPI.UserId[0] +'/is_following_story/' + indexGlobalAPI.StoryId.story_id)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it ('Role contributor-user:unfollow_story Post should work for test/v1/users/:userid/unfollow/stories', function(done) {
      async.eachSeries(indexGlobalAPI.UserId, function(id, cb) {
        agent
          .delete('/api/v1/users/' + indexGlobalAPI.UserId[0] +'/following/stories/'+indexGlobalAPI.StoryId.story_id)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(hasSaneStory)
          .end(function(err, res){
            if (err) cb(err); else cb();
          });
      }, function(err) {
           if (err) throw err; else done();
        });
    })*/

    it ('Post should work for Role contributor-user:view_follow_story test/v1/users/:userid/follow/stories with account_id', function(done) {
      async.eachSeries(indexGlobalAPI.UserAccountId, function(id, cb) {
        agent
          .post('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] +'/following/stories')
          .send(indexGlobalAPI.StoryId)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(hasSaneStory)
          .end(function(err, res){
            if (err) cb(err); else cb();
          });
      }, function(err) {
        if (err) throw err; else done();
      });
    })

    it ('Role contributor-user:get_user_stories should return the Story Followed By User /users/:userId/following/stories with account_id', function(done) {
      async.eachSeries(indexGlobalAPI.UserAccountId, function(id, cb) {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] + '/following/stories')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(storyIdInFollowedStory)
          .end(function(err, res){
            if (err) cb(err); else cb();
          });
      }, function(err) {
        if (err) throw err; else done();
      });
    })

    it ('Post should work for Role contributor-user:is_following_story /users/:userId/is_following_story/:storyId with account_id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/'+ indexGlobalAPI.UserAccountId[0] +'/is_following_story/' + indexGlobalAPI.StoryId.story_id)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it ('Role contributor-user:unfollow_story Post should work for test/v1/users/:userid/unfollow/stories', function(done) {
      async.eachSeries(indexGlobalAPI.UserAccountId, function(id, cb) {
        agent
          .delete('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] +'/following/stories/'+indexGlobalAPI.StoryId.story_id)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(hasSaneStory)
          .end(function(err, res){
            if (err) cb(err); else cb();
          });
      }, function(err) {
        if (err) throw err; else done();
      });
    })

  /*

    it ('Role contributor-content:delete_own_user_story Post should work for test/v1/stories/:storyId', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    })
    */

    it ('GET WORKER_TASK Topic /api/v1/topics/<topic_id>', function(done) {
      console.log("indexGlobalAPI.TopicId.topic_id" + indexGlobalAPI.TopicId.topic_id)
      co(function *() {
        agent
         .get('/api/v1/topics/' + indexGlobalAPI.TopicId.topic_id)
         .expect(200)
         .expect(GetTopicWorkerObject)
         .expect('Content-Type', /json/)
         .end(function(err, res) {
            if (err) return err;
            done();
         });
      })()
    });

    it ('Role contributor-Delete Story Post should work for test/v1/stories/:storyId', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.storyInfoType.story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    })

    it ('Role contributor Post should work for delete anonymous test/v1/stories/:storyId', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.anonymousStoryPostInfo.story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    })

    /*it('Post should work for Role contributor-user:user:follow_user test/v1/users/:userId/follow/users', function(done) {
      agent
        .post('/api/v1/users/' + indexGlobalAPI.UserId[0] +'/following/users')
        .send(indexGlobalAPI.FollowingId)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect(hasSaneUser)
        .end(function(err, res){
          if (err) return err;
            done();
        });
    })

    it ('Post should work for ROle contributor-user:is_following_user /users/:userId/is_following_user/:follow_userid', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/'+ indexGlobalAPI.UserId[0] +'/is_following_user/' + indexGlobalAPI.FollowingId.following_userid)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role contributor-user:user:get_user_following should return the User Followed By another User /users/:userId/following/users', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.UserId[0] + '/following/users')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(UserIdInFollowingUser)
          .end(function(err, res){
            if (err) return err;
              done();
          });
      })()
    })

    it('Role contributor-user:user:get_user_followers should return the User Followers By another User /users/:userId/followers', function(done){
      co(function *(){
        agent
          .get('/api/v1/users/' + indexGlobalAPI.FollowingId.following_userid + '/followers')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(UserIdInFollowerUser)
          .end(function(err, res){
            if (err) return err;
              done();
          });
      })()
    })

    it('Role contributor-user:user:unfollow_user Post should work for test/v1/users/:userid/unfollow/users', function(done){
      agent
        .delete('/api/v1/users/' + indexGlobalAPI.UserId[0] +'/following/users/'+indexGlobalAPI.FollowingId.following_userid)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect(hasSaneUser)
        .end(function(err, res){
          if (err) return err;
            done();
        });
    })*/

    it('Post should work for Role contributor-user:user:follow_user test/v1/users/:userId/follow/users with account_id', function(done) {
      agent
        .post('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] +'/following/users')
        .send(indexGlobalAPI.FollowingAccountId)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect(hasSaneUserAccount)
        .end(function(err, res){
          if (err) return err;
          done();
        });
    })

    it ('Post should work for Role contributor-user:is_following_user /users/:userId/is_following_user/:follow_userid with account_id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/'+ indexGlobalAPI.UserAccountId[0] +'/is_following_user/' + indexGlobalAPI.FollowingAccountId.following_userid)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role contributor-user:user:get_user_following should return the User Followed By another User /users/:userId/following/users with account_id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] + '/following/users')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(UserIdInFollowingUserAccount)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role contributor-user:user:get_user_followers should return the User Followers By another User /users/:userId/followers with account_id', function(done){
      co(function *(){
        agent
          .get('/api/v1/users/' + indexGlobalAPI.FollowingAccountId.following_userid + '/followers')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect(UserIdInFollowerUserAccount)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it('Role contributor-user:user:unfollow_user Post should work for test/v1/users/:userid/unfollow/users', function(done){
      agent
        .delete('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] +'/following/users/'+indexGlobalAPI.FollowingAccountId.following_userid)
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect(hasSaneUserAccount)
        .end(function(err, res){
          if (err) return err;
          done();
        });
    })

    /*it('POST /api/v1/search should return 200 and the same caption and positions', function(done){
       agent
         .get('/api/v1/search')
         .field('query', indexGlobalAPI.ontologySearch.query)
         .field('language', indexGlobalAPI.ontologySearch.language)
         .expect(200)
         .expect('Content-Type', /json/)
         .end(function(err, res){
           if(err) throw err; else done();
         });
    });*/

    it('Post should work for /user Role contributor-user:get_all_rewards', function(done) {
      co(function *() {
        agent
          .get('/api/v1/rewards')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return err;
              done();
          });
      })()
    })

    it('Post should work for /user Role contributor-user:get_any_reward', function(done) {
      co(function *() {
        agent
          .get('/api/v1/rewards/' + indexGlobalAPI.addPayoutInfo.reward_id + '?quantity=' + indexGlobalAPI.getRewardsInfo.quantity + '&credits=' + indexGlobalAPI.getRewardsInfo.credits)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(GetRewardsObject)
          .end(function(err, res) {
            if (err) return err;
              done();
          });
      })()
    })

    /*it('Post should work for /user/:userid/stories listStoriesByAuthor', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.UserId[0] + '/stories')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })*/

    it('Post should work for /user/:userid/stories listStoriesByAuthor with account_id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.UserAccountId[0] + '/stories')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    /*it ('Post should work for Role contributor /user/changepassword with userId', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/'+ indexGlobalAPI.UserId[0] +'/changepassword')
          .send(indexGlobalAPI.userChangePasswordUserId)
          .expect(200)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })

    it ('Post should work for Role contributor NEGATIVE /user/changepassword with userId', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/'+ indexGlobalAPI.UserId[0] +'/changepassword')
          .send(indexGlobalAPI.userChangePasswordUserId)
          .expect(400)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })*/

    it ('Post should work for Role contributor /user/changepassword with account_id', function(done) {
      co(function *() {
        console.log("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
        // indexGlobalAPI.workerBoolean value will decide if we want to run worker Test cases or not.
        if (indexGlobalAPI.workerBoolean)  yield Promise.delay(30000); // This delay is added to check worker is working properly or not.
        agent
          .post('/api/v1/users/'+ indexGlobalAPI.UserAccountId[0] +'/changepassword')
          .send(indexGlobalAPI.userChangePasswordUserId)
          .expect(200)
          .end(function(err, res){
            if (err) return err;
            done();
          });
      })()
    })
   // worker Test cases START
    if (indexGlobalAPI.workerBoolean) {

    it ('GET NOTIFICATION WORKER_TASK /api/v1/users/:accountId/notifications', function(done) {
      agent
        .get('/api/v1/users/me/notifications')
        .expect(200)
        .expect(GetAllNotificationObject)
        .end(function(err, res) {
          indexGlobalAPI.NotificationId.push(res.body.notifications[1].id);
          if (err) throw err; else done();
        });
    });

    it ('GET NOTIFICATION WORKER_TASK /api/v1/users/:accountId/notifications/:notificationId', function(done) {
      agent
        .get('/api/v1/users/me/notifications/' + indexGlobalAPI.NotificationId[0])
        .expect(200)
        .expect(GetNotificationObject)
        .end(function(err, res) {
          if (err) throw err; else done();
        });
    });

    it ('PUT WORKER_TASK NOTIFICATION  /api/v1/users/:accountId/notifications/seen', function(done) {
      indexGlobalAPI
      agent
        .put('/api/v1/users/me/notifications/seen')
        .send(indexGlobalAPI.NotificationId)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err; else done();
        });
    });

    it ('GET NEGATIVE NOTIFICATION WORKER_TASK /api/v1/users/:accountId/notifications/:notificationId', function(done) {
      agent
        .get('/api/v1/users/me/notifications/' + indexGlobalAPI.NotificationId[0])
        .expect(200)
        .expect(CheckPutSeenStatus)
        .end(function(err, res) {
          if (err) throw err; else done();
        });
    });

    it ('DELETE WORKER_TASK NOTIFICATION DELETE /api/v1/users/:accountId/notifications/:notificationId', function(done) {
      indexGlobalAPI
      agent
        .delete('/api/v1/users/me/notifications/' + indexGlobalAPI.NotificationId[0])
        .expect(200)
        .end(function(err, res) {
          if (err) throw err; else done();
        });
    });
    
      it ('GET WORKER_TASK /api/v1/stories/<story_id>/comments and should get one comment', function(done) {
        agent
          .get('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id  + '/comments')
          .expect(200)
          .expect(GetCommentWorkerObject)
          .end(function(err, res) {
            if (err) throw err; else done();
          });
      });

      it ('GET WORKER_TASK /api/v1/stories/<story_id>', function(done) {
	      console.log("indexGlobalAPI.StoryId.story_id  " + indexGlobalAPI.StoryId.story_id);
        agent
          .get('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id)
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(GetStoryWorkerObject)
          .end(function(err, res) {
            if (err) throw err;
              done();
          });
      });  

     

      it ('SEARCH IN REDSHIFT for logout EVENT .......', function(done) {
	      var query = "select * from " + config.redshift.eventTablename + " where (event='REST: POST /api/v1/logout') and (userid='" + indexGlobalAPI.accountId[0] + "');";
        agent
          .get('/api/v1/logs/search?query='+ query)
          //.send({'query':query})
          .set('Host', 'test.localhost')
          .expect(200)
          .expect(function(res) {
            if(indexGlobalAPI.UserId[0] != res.body.userid.trim()){ throw new Error("There is no entry found in Redshift"); }
          })
          .end(function(err, res) {
          if (err) {
            console.log('Redshift error : '+ err)
            throw err;
          }else done();
        });
      })
    }
   // worker Test cases END
    it('DELETE /api/v1/comments/<commentId>/replies/<replyId>', function(done){
      agent
        .delete('/api/v1/comments/' + indexGlobalAPI.testCommentId + '/replies/' + indexGlobalAPI.testReplyId)
        .expect(200)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });

    it('DELETE /api/v1/stories/:storyId/comments/:commentId', function(done){
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id  + '/comments/' + indexGlobalAPI.testCommentId)
        .expect(200)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    });

    it('DEL /api/v1/stories/<story_id>/objects/<object_id> and delete the object item', function(done){
      async.eachSeries(indexGlobalAPI.testObjectId, function(oid){
        agent
          .delete('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id + '/objects/' + oid)
          .expect(200)
          .end(function(err, res){
            if(err) throw err; else done();
          });
      });
    });

    it ('Role contributor-content:delete_own_user_story Post should work for test/v1/stories/:storyId', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .expect(getStoryStateInDelete)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    })

    it ('Role contributor-content:delete_own_user_story Post should work for test/v1/stories/:storyId with wait of 3000', function(done) {
      co (function* ()
      {
        console.log ("Please wait for 30000ms to Test Worker-Based Test cases:" + indexGlobalAPI.workerBoolean);
        // indexGlobalAPI.workerBoolean value will decide if we want to run worker Test cases or not.

        if (indexGlobalAPI.workerBoolean)  yield Promise.delay (30000); // This delay is added to check worker is working properly or not.
        agent
          .delete('/api/v1/stories/' + indexGlobalAPI.StoryId.story_id)
          .expect (400)
          .end (function (err, res) {
          if (err) throw err; else done ();
        });
      })();
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

    it('Role Admin-user Post should work for /login Admin', function(done) {
      co(function *() {
        agent
          .post('/api/v1/login')
          .set('Host', 'test.localhost')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send(indexGlobalAPI.loginAdminInfo)
          .expect(302)
          .expect('Content-Type', /text\/html/)
          .end(function(err, res){
            agent.saveCookies(res)
            if (err) return err;
              done();
          });
      })()
    })

    /*it('Post should work for Admin- Test anonymousStory /user/:userid/stories listStoriesByAuthor with User-id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.UserId[0] + '/stories')
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(adminGetAnonymousStory)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })*/

    it ('Role Admin-Delete Story Post should work for test/v1/stories/:storyId', function(done) {
      agent
        .delete('/api/v1/stories/' + indexGlobalAPI.anonymousNewStoryPostInfo.story_id)
        .expect(202)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if(err) throw err; else done();
        });
    })

    it ('Role Admin-Delete BlacklistItem Post should work for test/v1/moderation/blacklist/:black_lis_ite', function(done) {
      agent
        .delete('/api/v1/moderation/blacklist/' + indexGlobalAPI.blacklistItemId)
        .set('Host', 'test.localhost')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .end(function(err, res){
          if(err) throw err; else done();
        });
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

    it ('Post should work for NEGATIVE users/email/:emailid/forgotpassword-userId', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/email/'+ indexGlobalAPI.wrongemailid +'/forgotpassword')
          .expect(400)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })

    it ('Post should work for users/email/:emailid/forgotpassword', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/email/'+ indexGlobalAPI.emailid +'/forgotpassword')
          .expect(200)
          .end(function(err, res) {
            if (err) return err;
            done();
          });
      })()
    })
   // Reset password using UserId
    it ('Post should work for Role-contributor /resetpassword/:fp_code/:emailid', function(done) {
      co(function *() {
        indexGlobalAPI.forgotpasswordcode = yield UserAdminAPI.get_fpcode({"email":indexGlobalAPI.emailid});
        agent
          .post('/api/v1/resetpassword/' + indexGlobalAPI.forgotpasswordcode + '/' + indexGlobalAPI.emailid)
          .send(indexGlobalAPI.changePasswordUserInfo)
          .expect(200)
          .end(function(err, res) {
            if (err) return err;
            console.log("resetpassword:" + JSON.stringify(res.body))
            done();
          });
      })()
    })
})

function GetCommentWorkerObject(res) {
  if (!res.body instanceof Object) throw new Error("Comment res not an object!");
  if (res.body.comments[0].reply_count < 1) throw new Error("Reply count in content-worker is not working");
} 

function GetStoryWorkerObject(res) {
  if (!res.body instanceof Object) throw new Error("Story res not an object!");
	console.log("res.body.ontology.length " + res.body.ontology.length);
  if (res.body.ontology.length <= 1) throw new Error("ontology is not working");
  for (var i=0;i<res.body.objects.length;i++) {
    if (!res.body.objects[i].image_hex_color) throw new Error("Hex color is not calculated properly");
  }
	console.log("res.body.rank " + res.body.rank);
  if (res.body.rank === 0) throw new Error("Rank calculation of content-worker not working properly");
	console.log("res.body.comment_count " + res.body.comment_count);
  if (res.body.comment_count < 1) throw new Error("Comment count calculation of content-worker not working properly");  
} 

function GetTopicWorkerObject(res) {
  if (!res.body instanceof Object) throw new Error("Topic res not an object!");
  if (res.body.story_count < 1) throw new Error("Story count in content-worker is not working");
} 

function hasSaneRedirectURL(res) {
   if(res.headers.location != indexGlobalAPI.signUpInfo.success_redirect) throw new Error("Username and Password do not Match");
}

function hasSaneUser(res){
   if(!res.body instanceof Object) throw new Error("User res not an object!");
   if(res.body.id != indexGlobalAPI.FollowingId.following_userid) throw new Error("The User followed was different from the given one");
}

function hasSaneUserAccount(res){
  if(!res.body instanceof Object) throw new Error("User res not an object!");
  if(res.body.account_id != indexGlobalAPI.FollowingAccountId.following_userid) throw new Error("The User followed was different from the given one");
}

function UserIdInFollowingUser(res){
   if(!arrayHasKeyValue(res.body.following,"id",indexGlobalAPI.FollowingId.following_userid)){
       throw new Error("There is some issue in following User");
   }
}

function UserIdInFollowingUserAccount(res){
  if(!arrayHasKeyValue(res.body.following,"account_id",indexGlobalAPI.FollowingAccountId.following_userid)){
    throw new Error("There is some issue in following User");
  }
}

function UserIdInFollowerUser(res){
   if(!arrayHasKeyValue(res.body.followers,"id",indexGlobalAPI.UserId[0])){
       throw new Error("There is some issue in follower User");
   }
}

function UserIdInFollowerUserAccount(res){
  if(!arrayHasKeyValue(res.body.followers,"account_id",indexGlobalAPI.UserAccountId[0])){
    throw new Error("There is some issue in follower User");
  }
}

function hasSaneStory(res){
   if(!res.body instanceof Object) throw new Error("Story res not an object!");
   if(res.body.id != indexGlobalAPI.StoryId.story_id) throw new Error("The Story followed was different from the given one");

}

function ValidComments(res) {
  console.log("res.body.comment:" + JSON.stringify(res.body.comments[0].comment));
   if(!res.body instanceof Object) throw new Error("Comment updated res not an object!");
   if(!res.body.comments instanceof Array && res.body.comments.length !== 1) throw new Error("Comments get res not an array of one comments!");
   if(res.body.comments[0].comment != indexGlobalAPI.commentPostInfo.comment) throw new Error("The comment text did't match");
   //@todo make test cases for is_anonymous work
   // if(res.body.comments[0].author_name != indexGlobalAPI.commentPostInfo.author_name) throw new Error("The author_name didn't match");
}

function ValidRepliesOnComment(res) {
  if(!res.body instanceof Object) throw new Error("Reply res not an object!");
  if(!res.body.replies instanceof Array && res.body.replies.length !== 1) throw new Error("Replies get res not an array of one reply!");
  if(res.body.replies[0].reply != indexGlobalAPI.commentReplyInfo.reply) throw new Error("The reply text did't match");
  //@todo make test cases for is_anonymous work
  // if(res.body.replies[0].author_name != indexGlobalAPI.commentReplyInfo.author_name) throw new Error("The author_name didn't match");
}

function PostStoryTest(res){
   if(!res.body instanceof Object) throw new Error("Story res not an object!");
   if(res.body.title != indexGlobalAPI.storyPostInfo.title) throw new Error("The title posted was different from the given one");
   //@todo make test cases for is_anonymous work
   // if(res.body.author_name != indexGlobalAPI.storyPostInfo.author_name) throw new Error("The author_name was different as the posted one");
   indexGlobalAPI.testStoryId.push(res.body.id);
   indexGlobalAPI.testStoryReplyObject = res.body;
}

function GetStoryTest(res){
   if(!res.body instanceof Object) throw new Error("Story res not an object!");
   if(res.body.title != indexGlobalAPI.storyPostInfo.title) throw new Error("The title posted was different from the given one");
  // Changes in getprofile if(res.body.author_name != storyPostInfo.author_name) throw new Error("The author_name was different as the posted one");
}

function GetStoryStateInPost(res){
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'public') throw new Error("The story status in not public");
}

function GetStoryStateInPostWithDraft(res){
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'draft') throw new Error("The story status in not draft");
}

function GetStoryStateInPut(res){
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'public') throw new Error("The story status in not public");
}

function GetStoryStateInPutWithDraft(res){
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'draft') throw new Error("The story status in not draft");
}

function GetStoryStateInGet(res){
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'public') throw new Error("The story status in not public");
}

function GetStoryStateInGetWithDraft(res){
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'draft') throw new Error("The story status in not draft");
}

function getStoryStateInDelete(res){
  if(!res.body instanceof Object) throw new Error("Story res not an object!");
  if(res.body.status != 'deleted') throw new Error("The story status in not deleted");
}

function PutStoryTest(res){
   if(!res.body instanceof Object) throw new Error("Story res not an object!");
   if(res.body.title != indexGlobalAPI.storyPutInfo.title) throw new Error("The updated title did't match");
}

function PostObjectTest(res){
   if(!res.body instanceof Object) throw new Error("Object res not an object!");
   if(res.body.caption != indexGlobalAPI.objectPostInfo.caption) throw new Error("The object caption did't match");
   if(res.body.position != indexGlobalAPI.objectPostInfo.position) throw new Error("The updated author_name didn't match");
   indexGlobalAPI.testObjectId.push(res.body.id)
}

function PutObjectTest(res){
   if(!res.body instanceof Object) throw new Error("Object res not an object!");
   if(res.body.caption != indexGlobalAPI.objectPutInfo.caption) throw new Error("The object updated caption did't match");
}

function storyIdInFollowedStory(res){
   if(!arrayHasKeyValue(res.body.stories,"id",indexGlobalAPI.StoryId.story_id)){
       throw new Error("There is some issue in following Story");
   }
}

function arrayHasKeyValue(arr,key,value){ //Helper function to check if key value exist in array
   for(var i = 0 ;i <arr.length ; i++){
       if(arr[i][key] === value){
           return true;
       }
   }
   return false;
}

function PostCommentTest(res){
   if(!res.body instanceof Object) throw new Error("Comment res not an object!");
   if(res.body.comment != indexGlobalAPI.commentPostInfo.comment) throw new Error("The comments did't match");
   //@todo make test cases for is_anonymous work
   // if(res.body.author_name != indexGlobalAPI.commentPostInfo.author_name) throw new Error("The author_name didn't match");
   indexGlobalAPI.testCommentId.push(res.body.id)
}

function PostReplyTest(res){
  if(!res.body instanceof Object) throw new Error("Reply res not an object!");
  if(res.body.reply != indexGlobalAPI.commentReplyInfo.reply) throw new Error("Reply did't match");
  //@todo make test cases for is_anonymous work
  // if(res.body.author_name != indexGlobalAPI.commentReplyInfo.author_name) throw new Error("The author_name didn't match");
}

function PostUpdateReplyTest(res){
  if(!res.body instanceof Object) throw new Error("Reply res not an object!");
  if(res.body.reply != indexGlobalAPI.commentEditReplyInfo.reply) throw new Error("Reply did't match");
}

function PostCommentUpdateTest(res){
   if(!res.body instanceof Object) throw new Error("Comment res not an object!");
   if(res.body.comment != indexGlobalAPI.commentPutInfo.comment) throw new Error("The comments did't match");
}

function GetRewardsObject(res) {
  if (!res.body instanceof Object) throw new Error("Reward res not an object!");
  if (res.body.id != indexGlobalAPI.addPayoutInfo.reward_id) throw new Error("The Reward Id was different from the given one");
}

function anonymousStory(res) {
  if (!res.body instanceof Object) throw new Error("Story res not an object!");
  if (res.body.author_account_id) throw new Error("Story res has author_account_id!");
//  if (res.body.author_user_id) throw new Error("Story res has author_user_id!");
  if (res.body.author_name != indexGlobalAPI.anonymousStoryPostInfo.author_name) throw new Error("The author_name didn't match");
}

function anonymousComment(res) {
  if (!res.body instanceof Object) throw new Error("Comment res not an object!");
  if (res.body.author_account_id) throw new Error("Comment res has author_account_id!");
//  if (res.body.author_user_id) throw new Error("Comment res has author_user_id!");
  if (res.body.author_name != indexGlobalAPI.anonymousCommentPostInfo.author_name) throw new Error("The author_name didn't match");
}

function anonymousCommentReply(res) {
  if (!res.body instanceof Object) throw new Error("Comment res not an object!");
  if (res.body.author_account_id) throw new Error("Comment res has author_account_id!");
//  if (res.body.author_user_id) throw new Error("Comment res has author_user_id!");
  if (res.body.author_name != indexGlobalAPI.anonymousCommentReplyInfo.author_name) throw new Error("The author_name didn't match");
}

function infoTypeStoryObject(res) {
  if (!res.body instanceof Object) throw new Error("Story res not an object!");
  if (res.body.type != 'info_post') throw new Error("Story Type is not of info_post");
  if (res.body.rank != 100000) throw new Error(" Info story rank is not correct!");
  if (res.body.title != indexGlobalAPI.storyInfoType.title) throw new Error("The author_name didn't match");
}

function getAnonymousOwnStory(res) {
  if (!res.body instanceof Object) throw new Error("Anonymous Story res not an object!");
  if (!arrayHasKeyValue(res.body.stories,"id",indexGlobalAPI.anonymousStoryPostInfo.story_id)) {
    throw new Error("User not able to find his Own Story");
  }   
}

function getAnonymousOtherStory(res) {
  if (!res.body instanceof Object) throw new Error("Anonymous Story res not an object!");
  if (arrayHasKeyValue(res.body.stories,"id",indexGlobalAPI.anonymousNewStoryPostInfo.story_id)) {
    throw new Error("User able to find other User's Story");
  }   
}

function adminGetAnonymousStory(res) {
  if (!res.body instanceof Object) throw new Error("Anonymous Story res not an object!");
  if (!arrayHasKeyValue(res.body.stories,"id",indexGlobalAPI.anonymousStoryPostInfo.story_id)) {
    throw new Error("Admin not able to find User Story");
  }   
}

function GetAllNotificationObject(res) {
  if (!res.body instanceof Object) throw new Error("notification res not an object!");
  // if (!res.body.notifications[0]) throw new Error("User Id not exist for notification");
}

function GetNotificationObject(res) {
  if (!res.body instanceof Object) throw new Error("notification res not an object!");
  if (res.body.seen_status != 'unseen') throw new Error("notification seen_status didn't match");
}

function CheckPutSeenStatus(res) {
  if (!res.body instanceof Object) throw new Error("notification res not an object!");
  if (res.body.seen_status != 'seen') throw new Error("notification seen_status didn't match");
}

function GetStoryTestModeration(res){
  if(!res.body instanceof Object) throw new Error("stroy res not an object!");
  if(res.body.status != 'human_moderation') throw new Error("The story status in not human_moderation");
}

