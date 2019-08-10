// require the necessary stuff
require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const Pool = require("pg").Pool;
const pool = new Pool({
    user: 'me',
    host: 'localhost',
    database: 'api',
    password: process.env.DB_SECRET,
    port: 5432,
})

const routes = require("./routes/routes");

// configure the app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// auth
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));


// configure local strategy
passport.use(new LocalStrategy((username, password, done) => {
    pool.query('SELECT id, username, password FROM users WHERE username = $1', [username], (err, result) => {
        if (err) {
            console.log(err);
            return done(err);
        }

        if (result.rows.length > 0) {
            const first = result.rows[0];
            if (!bcrypt.compareSync(password, first.password)) done(null, false);
            else done(null, first);

        } else done(null, false);
    });
}));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    pool.query('SELECT id, username FROM users WHERE id = $1', [parseInt(id, 10)], (err, results) => {
        if (err) {
            console.log(err);
            return done(err);
        }
        done(null, results.rows[0]);
    });
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    next();
 });
app.use(routes);


app.listen(process.env.PORT, () => {
    console.log(`Application is running`);
});