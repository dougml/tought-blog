const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("express-flash");
require('dotenv').config();
const secretHash = process.env.SECRET_HASH

//Routes
const ToughtController = require("./controllers/ToughtController");
const toughtsRoutes = require("./routes/toughtsRoutes");
const authRoutes = require("./routes/authRoutes");

// Models
// const Tought = require("./models/Tought");
// const User = require("./models/User");

const app = express();
const PORT = 3000;

const conn = require("./db/conn");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: true,
    })
);

// public assets and json req
app.use(express.json());
app.use(express.static("public"));

//session config
app.use(
    session({
        name: "session",
        secret: secretHash,
        resave: false,
        saveUninitialized: false,
        store: new FileStore({
            logFn: function () {},
            path: require("path").join(require("os").tmpdir(), "sessions"),
        }),
        cookie: {
            secure: false,
            maxAge: 360000,
            expires: new Date(Date.now() + 360000),
            httpOnly: true,
        },
    })
);

//Flash messages
app.use(flash());

//set session to res
app.use((req, res, next) => {
    if (req.session.userid) {
        res.locals.session = req.session;
    }
    next();
});

//Routes
app.use("/toughts", toughtsRoutes);
app.use("/", authRoutes);
app.get("/", ToughtController.showToughts);

// Middleware para páginas 404
app.use((req, res, next) => {
    res.status(404).render("404");
});

conn
.sync()
    // .sync({force: true})
    .then(() => {
        app.listen(PORT, () => {
            console.log("Servidor rodando na porta: " + PORT);
        });
    })
    .catch((err) => console.log(err));
