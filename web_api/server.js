
var koa = require("koa");
var app = koa();
var send = require("koa-send");
var views = require("koa-views");
var mount = require("koa-mount");
var statview = require("co-views");
var path = require("path");
var me = 5;
var bodyparser = require("koa-bodyparser");
var koarender = require("koa-render");
var v1 = require('./');
var render = statview(path.join(__dirname , ".." ,"public"),{ map: { html: 'underscore', js: "js" }});
// for development propose only
app.use(require('koa-cors')({
methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS',
credentials: true
}));

app.use(function *(next){
  try
    {
    yield next; 
    //pass on the execution to downstream middlewares
    } catch (err) 
    { 
    //executed only when an error occurs & no other middleware responds to the request
    this.type = 'json'; //optiona here
    this.status = err.status || 500;
    this.body = { 'error' : 'The application is not responding because of some error;) '};
    //delegate the error back to application
    this.app.emit('error', err, this);
    }
});
app.use(bodyparser());
// app.use(views("./views",{map:{html:'underscore'}}));
app.use(mount(v1.middleware()));
app.use(function *(){
   if ('/'  == this.path || '/test' == this.path)  {
     return this.body = yield render("index.html");
   }
   else {
     yield send(this, this.path, { root: path.join(__dirname , ".." ,"public")});
   }
})
app.listen(3000);
console.log("server started");
