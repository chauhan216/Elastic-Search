var web_api = require('../../../web_api/server')
   , request = require('supertest')
   , co = require('co')
   , agent = request.agent('http://local.epikko.io:9070')
   // , indexGlobalAPI = require('./index_global.js')


describe('UserAPI Test Cases',function() {
  console.log("sdfsdfsd"); 
    it('Post should work for test/v1/signup', function(done) {
      co(function *() {
        agent
          .post('/api/v1/signup')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send(indexGlobalAPI.signUpInfo)
          .expect(302)
          .expect('Content-Type', /text\/html/)
          .expect(hasSaneRedirectURL)
          .end(function(err, res){
            console.log("err: signup" + JSON.stringify(err) );
            if (err) return err;
              done();
           });
      })()
    })

    it('Post login', function(done) {
      co(function *() {
        agent
          .post('/api/v1/signup')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send(indexGlobalAPI.signUpInfo)
          .expect(302)
          .expect('Content-Type', /text\/html/)
          .expect(hasSaneRedirectURL)
          .end(function(err, res){
            console.log("err: signup" + JSON.stringify(err) );
            if (err) return err;
              done();
           });
      })()
    })
})
// PRIVATE helpers --------------->

function hasSaneRedirectURL(res) {
   console.log("hasSaneRedirectURL:" + JSON.stringify(res.headers.location));
}
