import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
const mongoose = require('mongoose');
import passportLocalMongoose from 'passport-local-mongoose';
import connectEnsureLogin from 'connect-ensure-login';


const app = express();

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));


const port = process.env.PORT || 3000;

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost/MyDatabase',
  { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const UserDetail = new Schema({
  username: String,
  password: String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail);


passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

app.post('/login', (req, res, next) => {
    passport.authenticate('local',
    (err, user, info) => {
      if (err) {
        return next(err);
      }
  
      if (!user) {
        return res.redirect('/login?info=' + info);
      }
  
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
  
        return res.redirect('/');
      });
  
    })(req, res, next);
  });
  
  app.get('/login',
    (req, res) => res.sendFile('html/login.html',
    { root: __dirname })
  );
  
  app.get('/',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.sendFile('html/index.html', {root: __dirname})
  );
  
  app.get('/private',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.sendFile('html/private.html', {root: __dirname})
  );
  
  app.get('/user',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.send({user: req.user})
  );


app.get('/', (req, res) => res.send('hello world'));

app.listen(port, () => console.log(`Example app listening on port:${port}`));
