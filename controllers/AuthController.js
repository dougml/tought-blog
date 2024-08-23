const Tought = require("../models/Tought");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

module.exports = class AuthController {
    static async login(req, res) {

        const userid = req.session.userid

        if (userid) {
            res.redirect('toughts/')
            return
        }
        
        res.render("auth/login");
    }

    static async loginPost(req, res) {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email: email } });


        if (!user) {
            req.flash("message", "Usuario não encontrado");
            res.render("auth/login");
            return;
        }
        // check if password match

        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) {
            req.flash("message", "Senha inválida");
            res.render("auth/login");
            return;
        }

        // Initialize session
        req.flash("message", "Login realizado com sucesso");
        req.session.userid = user.id;
        req.session.save(() => {
            res.redirect("toughts/dashboard");
        });
    }

    static async register(req, res) {
        res.render("auth/register");
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmpassword } = req.body;

        if (password !== confirmpassword) {
            req.flash("message", "As senhas não estão iguais");
            res.render("auth/register");
            return;
        }

        const checkUserExists = await User.findOne({ where: { email: email } });

        if (checkUserExists) {
            req.flash("message", "E-mail já cadastrado");
            res.render("auth/register");
            return;
        }

        // Create a password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = {
            name,
            email,
            password: hashedPassword,
        };

        try {
            const createdUser = await User.create(user);

            // Initialize session
            req.session.userid = createdUser.id;
            req.session.save(() => {
                res.redirect("/");
            });
        } catch (error) {
            console.log(error);
        }
    }

    static logout(req, res) {
        req.session.destroy(() => {
            res.redirect("/login");
        });
    }

    static home(req, res){
        res.render('toughts/home')
    }
};
