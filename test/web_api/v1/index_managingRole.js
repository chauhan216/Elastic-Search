var web_api = require('../../../web_api/server')
   , request = require('supertest')
   , co = require('co')
   , async = require('async')
   , valids = require('validator')
   , agent = request.agent('http://local.zmc.io:9070')
   , indexGlobalAPI = require('./index_global.js')

    describe ('managing_editor Role Test Cases', function() {
    
      it('Post should work for /login', function(done) {
      co(function *() {
        agent
          .post('/api/v1/login')
          .set('Content-Type', 'application/x-www-form-urlencoded')
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
          .end(function(err, res){
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


    it('Role managing_editor-user Post should work for /login ', function(done) {
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

    it('Post should work for /user Role managing_editor-user:view_any_profile', function(done) {
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

    it('Post should work for /user Role managing_editor-user:view_any_profile with account_id', function(done) {
      co(function *() {
        agent
          .get('/api/v1/users/' + indexGlobalAPI.View_profile_UserAccountID)
          .set('Host', 'test.localhost')
          .end(function(err, res){
            UserId = [res.body.id];
            UserAccountId = [res.body.account_id];
            if (err) return err;
            done();
          });
      })()
    })
 
    /*it ('Role managing_editor-user:assign_role Post should work for  Assign role test/v1/users/:userId/assign/role', function(done) {
      console.log("--->>>>>" + JSON.stringify(indexGlobalAPI.ManagingRoleInfo));
      co(function *() {
        agent
          .post('/api/v1/users/' + UserId[0] + '/assign/role')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.ManagingRoleInfo)
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .end(function(err, res){
            if (err) {
              return err}
            done();
          });
      })()
    })*/

    it ('Role managing_editor-user:assign_role Post should work for  Assign role test/v1/users/:userId/assign/role with account_id', function(done) {
      co(function *() {
        agent
          .post('/api/v1/users/' + UserAccountId[0] + '/assign/role')
          .set('Host', 'test.localhost')
          .send(indexGlobalAPI.ManagingRoleInfo)
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

    it('Role community_editor-content:edit_any_topic PUT /api/v1/topics/<topic_id>', function(done){
      co(function *() {
        agent
          .put('/api/v1/topics/' + indexGlobalAPI.TopicId.topic_id)
          .send(indexGlobalAPI.topicPutInfo)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err) return err;
              done();
          });
      })()    
    });  

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
  })  
