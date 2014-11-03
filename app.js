var express = require('express');
var app = express();
var bodyParser  = require('body-parser');
var Handlebars = require('handlebars'); // for html rendering
var fs = require('fs');
var url = require('url'); // for url parsing
var cookieParser = require('cookie-parser');

//Assume users-pw combos are unique
//Cookies can be spoofed.

var data = fs.readFileSync('templates/admin.html','utf8');
var admin_template = Handlebars.compile(data);
data = fs.readFileSync('templates/user.html','utf8');
var user_template = Handlebars.compile(data);
data = fs.readFileSync('templates/user_as_admin.html','utf8');
var user_as_admin_template = Handlebars.compile(data);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var load_login_page = function(res){
    fs.readFile('templates/index.html','utf8', function(err, data) {
        if (err) {
            res.send("Couldn't read index");
        } else
            res.send(data);
    });
}

// Clear session and return to login page
app.get('/logout', function(req, res){
    res.clearCookie('username');
    load_login_page(res);
});

// If session exists, redirect to console. Else, redirect to login page
app.get('/', function(req, res) {
    if (req.cookies.username) {
        if (req.cookies.username === "admin") { //logged in
            var result = admin_template(admin);
            res.send(result);
        } else if (req.cookies.username.length > 0) {
            if (users.hasOwnProperty(req.cookies.username)) {
                var result = user_template(users[req.cookies.username]);
                res.send(result);
            }
        }
    } else {
        load_login_page(res); //bounce back
    }
});

//Show admin what a user page looks like from their perspective
app.get('/getuser', function(req, res) {
    if (req.cookies.username) {
        if (req.cookies.username === "admin") {
            var parsed = url.parse(req.url, true);
            var username = parsed.query.user;
            if (users.hasOwnProperty(username)) {
                res.send(user_as_admin_template(users[username]));
                return;
            }
        }
    }
    res.send("Error: restricted access ahead");
});

//Load user console if session exists
app.get('/console', function(req,res){ //TODO change to console
    if (req.cookies.username) {
        if (req.cookies.username === "admin") { //logged in
            var result = admin_template(admin);
            res.send(result);
        } else if (req.cookies.username.length > 0) {
            if (users.hasOwnProperty(req.cookies.username)) {
                var result = user_template(users[req.cookies.username]);
                res.send(result);
            }
        }
    }
});

//Attempt user log in. Session is created here.
app.post('/console', function(req,res){
    var user_attempt = {"name":req.body.name, "password" : req.body.password};
    if (users.hasOwnProperty(user_attempt.name)) { //log in as user
        if (users[user_attempt.name].password === user_attempt.password) {
            var result = user_template(users[user_attempt.name]);
            res.cookie('username',user_attempt.name, { maxAge: 900000, httpOnly: true });
            res.send(result);
        }
    }
    else if (user_attempt.name === admin.name && user_attempt.password === admin.password) { // as admin
        var result = admin_template(admin);
        res.cookie('username', 'admin', { maxAge: 900000, httpOnly: true });
        res.send(result);
    }
    else { //redirect to login page
        load_login_page(res);
    }
});

app.listen(8080, function(){
    console.log('listening on 8080');
});

//Hardcoded data
var users = {
    "Kari Dejesus":
    {
        "name": "Kari Dejesus",
        "message": "Incididunt consequat nulla sit consequat eu anim anim enim incididunt sint in proident. Nisi officia velit voluptate aliqua esse magna id incididunt ut qui. Quis amet irure velit irure magna.\r\n",
        "password": "1"
    },

    "Carla Shields":
    {
        "name": "Carla Shields",
        "message": "Enim in et cillum est non quis id incididunt ut exercitation ex cillum magna. Aliquip do in fugiat magna et Lorem minim dolor nulla dolor. Et laboris dolore eiusmod pariatur nostrud ex commodo incididunt nisi eiusmod elit Lorem et. Aliquip ad sint commodo consequat sunt aliquip. Enim quis sunt irure nulla et dolore duis culpa ullamco non. Esse ut commodo sint deserunt exercitation qui excepteur veniam. Sunt consequat anim do irure veniam culpa proident non.\r\n",
        "password": "2"
    },
    "Clara Henry":
    {
        "name": "Clara Henry",
        "message": "Tempor proident magna veniam consequat duis ex excepteur adipisicing quis ea do culpa aute. Culpa velit nisi aliqua id ut consectetur eu tempor consequat consectetur. Aliquip reprehenderit aliquip dolor laborum ea et deserunt. Aliqua et tempor nostrud consequat nostrud sunt occaecat ipsum magna Lorem. Ad reprehenderit exercitation laborum velit duis sit esse id eu esse. Consectetur voluptate veniam nulla ipsum Lorem do.\r\n",
        "password": "3"
    },
    "Quinn Nieves":
    {
        "name": "Quinn Nieves",
        "message": "Mollit sit enim laboris voluptate cupidatat minim commodo ea dolore laboris Lorem. Dolor exercitation enim aute id ea esse. Commodo esse commodo est consectetur laborum ea in officia pariatur irure sunt. Ut et laborum exercitation esse culpa elit officia velit culpa in anim irure.\r\n",
        "password": "4"
    },
    "Aurora Vargas":
    {
        "name": "Aurora Vargas",
        "message": "Magna reprehenderit excepteur fugiat est. Tempor cupidatat id pariatur deserunt reprehenderit proident. Minim aliqua amet incididunt officia reprehenderit sint cupidatat. Commodo consectetur ullamco qui ea est sit. Adipisicing ad ullamco veniam dolor cupidatat quis culpa. Sit magna adipisicing non nisi id consectetur elit deserunt consectetur et.\r\n",
        "password": "5"
    },
    "Glass Murray":
    {
        "name": "Glass Murray",
        "message": "Consectetur labore elit ullamco sit anim aliqua amet sunt et elit. Deserunt officia excepteur dolore officia ullamco enim cillum in minim. Proident anim anim culpa nisi pariatur.\r\n",
        "password": "6"
    }
};

var admin =  {
    name : "Roy Iacob",
    password : "password",
    message : "My Random message",
    users : users
};