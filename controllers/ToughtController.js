const { where } = require("sequelize");
const Tought = require("../models/Tought");
const User = require("../models/User");

const { Op } = require("sequelize");

module.exports = class ToughtController {
    static async showToughts(req, res) {
        let search = "";

        if (req.query.search) {
            search = req.query.search;
        }

        let order = 'DESC'

        if (req.query.order === 'old') {
            order = 'ASC'
        }

        try {
            const toughtsData = await Tought.findAll({
                include: User,
                where: {
                    title: { [Op.like]: `%${search}%` },
                },
                order:[['createdAt', order]]
            });

            const toughts = toughtsData.map((result) =>
                result.get({ plain: true })
            );

            let toughtsQty = toughts.length;

            res.render("toughts/home", { toughts, search, toughtsQty });
        } catch (error) {
            console.error("Erro ao buscar pensamentos:", error);
            req.flash(
                "message",
                "Ocorreu um erro ao carregar os pensamentos. Tente novamente mais tarde."
            );
            res.redirect("/");
        }
    }

    static async dashboard(req, res) {
        const userId = req.session.userid;

        try {
            const user = await User.findOne({
                where: {
                    id: userId,
                },
                include: Tought,
                plain: true,
            });

            if (!user) {
                return res.redirect("/login");
            }

            // Verifica se o usuário possui pensamentos
            const toughts = user.Toughts
                ? user.Toughts.map((result) => result.dataValues)
                : [];

            res.render("toughts/dashboard", { toughts });
        } catch (error) {
            console.error("Erro ao carregar o dashboard:", error);
            req.flash(
                "message",
                "Ocorreu um erro ao carregar o dashboard. Tente novamente mais tarde."
            );
            res.redirect("/");
        }
    }

    static async createTought(req, res) {
        res.render("toughts/create");
    }

    static async createToughtSave(req, res) {
        const tought = {
            title: req.body.title,
            UserId: req.session.userid,
        };

        try {
            await Tought.create(tought);

            req.flash("message", "Pensamento criado");
            req.session.save(() => {
                res.redirect("/toughts/dashboard");
            });
        } catch (error) {
            console.log(error);
            res.status(500).send("Erro ao criar pensamento");
        }
    }

    static async removeTought(req, res) {
        const id = req.body.id;
        const UserId = req.session.userid;
        try {
            await Tought.destroy({
                where: {
                    id: id,
                    UserId: UserId,
                },
            });
            res.redirect("/toughts/dashboard");
        } catch (error) {
            req.flash("message", `Erro ao apagar o pensamento`);
            res.redirect("/toughts/dashboard");
        }
    }

    static async updateTought(req, res) {
        const id = req.params.id;

        const tought = await Tought.findOne({
            where: {
                id: id,
            },
            raw: true,
        });
        res.render("toughts/edit", { tought });
    }

    static async updateToughtPost(req, res) {
        const id = req.body.id;

        const tought = {
            title: req.body.title,
        };

        try {
            await Tought.update(tought, { where: { id: id } });

            req.flash("message", "Pensamento atualizado");

            req.session.save(() => {
                res.redirect("/toughts/dashboard");
            });
        } catch (error) {
            console.log(error);
            req.flash("message", "Erro ao atualizar pensamento");
            req.session.save(() => {
                res.redirect("/toughts/dashboard");
            });
        }
    }
};
