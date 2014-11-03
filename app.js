var express = require('express');
var app = express();
var bodyParser  = require('body-parser');
var Handlebars = require('handlebars');
var fs = require('fs');
var url = require('url');
var cookieParser = require('cookie-parser');

var users = [
    {
        "name": "Kari Dejesus",
        "message": "Incididunt consequat nulla sit consequat eu anim anim enim incididunt sint in proident. Nisi officia velit voluptate aliqua esse magna id incididunt ut qui. Quis amet irure velit irure magna.\r\n",
        "password": "1"
    },
    {
        "name": "Carla Shields",
        "message": "Enim in et cillum est non quis id incididunt ut exercitation ex cillum magna. Aliquip do in fugiat magna et Lorem minim dolor nulla dolor. Et laboris dolore eiusmod pariatur nostrud ex commodo incididunt nisi eiusmod elit Lorem et. Aliquip ad sint commodo consequat sunt aliquip. Enim quis sunt irure nulla et dolore duis culpa ullamco non. Esse ut commodo sint deserunt exercitation qui excepteur veniam. Sunt consequat anim do irure veniam culpa proident non.\r\n",
        "password": "2"
    },
    {
        "name": "Clara Henry",
        "message": "Tempor proident magna veniam consequat duis ex excepteur adipisicing quis ea do culpa aute. Culpa velit nisi aliqua id ut consectetur eu tempor consequat consectetur. Aliquip reprehenderit aliquip dolor laborum ea et deserunt. Aliqua et tempor nostrud consequat nostrud sunt occaecat ipsum magna Lorem. Ad reprehenderit exercitation laborum velit duis sit esse id eu esse. Consectetur voluptate veniam nulla ipsum Lorem do.\r\n",
        "password": "3"
    },
    {
        "name": "Quinn Nieves",
        "message": "Mollit sit enim laboris voluptate cupidatat minim commodo ea dolore laboris Lorem. Dolor exercitation enim aute id ea esse. Commodo esse commodo est consectetur laborum ea in officia pariatur irure sunt. Ut et laborum exercitation esse culpa elit officia velit culpa in anim irure.\r\n",
        "password": "4"
    },
    {
        "name": "Aurora Vargas",
        "message": "Magna reprehenderit excepteur fugiat est. Tempor cupidatat id pariatur deserunt reprehenderit proident. Minim aliqua amet incididunt officia reprehenderit sint cupidatat. Commodo consectetur ullamco qui ea est sit. Adipisicing ad ullamco veniam dolor cupidatat quis culpa. Sit magna adipisicing non nisi id consectetur elit deserunt consectetur et.\r\n",
        "password": "5"
    },
    {
        "name": "Glass Murray",
        "message": "Consectetur labore elit ullamco sit anim aliqua amet sunt et elit. Deserunt officia excepteur dolore officia ullamco enim cillum in minim. Proident anim anim culpa nisi pariatur.\r\n",
        "password": "6"
    }
];

var admin =  {
    name : "Roy Iacob",
    password : "password",
    message : "My Random message",
    users : users
};

var data = fs.readFileSync('admin.html','utf8');
var admin_template = Handlebars.compile(data);
data = fs.readFileSync('user.html','utf8');
var user_template = Handlebars.compile(data);
data = fs.readFileSync('user_as_admin.html','utf8');
var user_as_admin_template = Handlebars.compile(data);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


var load_login_page = function(res){
    fs.readFile('index.html','utf8', function(err, data) {
        if (err) {
            res.send("Couldn't read index");
        } else
            res.send(data);
    });
}

app.get('/logout', function(req, res){
    res.clearCookie('username');
    load_login_page(res);
});

app.get('/', function(req, res) {  //index.html
    if (req.cookies.username != null) {
        if (req.cookies.username === "admin") { //logged in
            var result = admin_template(admin);
            res.send(result);
            return;
        } else if (req.cookies.username.length > 0) {
            for (var i = 0; i < users.length; i++) {
                if (req.cookies.username === users[i].name) {
                    var result = user_template(users[i]);
                    res.send(result);
                    return;
                }
            }
        }
    }
    load_login_page(res);
});

app.get('/getuser', function(req, res) {
    if (req.cookies.username != null) {
        if (req.cookies.username === "admin") {
            var parsed = url.parse(req.url, true);
            var username = parsed.query.user;
            for (i = 0; i < users.length; i++) {
                if (users[i].name === username) {
                    res.send(user_as_admin_template(users[i]));
                    return;
                }
            }
        }
    }
    res.send("Error: restricted access ahead");
});

app.get('/login', function(req,res){ //TODO change to console
    console.log("COOKIE:" + req.cookies.username);
    if (req.cookies.username != null) {
        if (req.cookies.username === "admin") { //logged in
            var result = admin_template(admin);
            res.send(result);
            return;
        } else if (req.cookies.username.length > 0) {
            for (var i = 0; i < users.length; i++) {
                if (req.cookies.username === users[i].name) {
                    var result = user_template(users[i]);
                    res.send(result);
                    return;
                }
            }
        }
    }
});

app.post('/login', function(req,res){
    var user_attempt = {"name":req.body.name, "password" : req.body.password};
    for (var i = 0; i < users.length; i++) {
        if (user_attempt.name === users[i].name && user_attempt.password === users[i].password) {
            var result = user_template(users[i]);
            res.cookie('username',users[i].name, { maxAge: 900000, httpOnly: true });
            res.send(result);
            return;
        }
    }

    if (user_attempt.name === admin.name && user_attempt.password === admin.password) {
        var result = admin_template(admin);
        res.cookie('username', 'admin', { maxAge: 900000, httpOnly: true });
        res.send(result);
        return;
    }
    load_login_page(res);
});

app.listen(8080, function(){
    console.log('listening on 8080');
});
