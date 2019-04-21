const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SEED = require("../config/config").SEED;

const app = express();

const Usuario = require("../models/usuario");

// ====================================
//  Autenticacion de ggogle
// ====================================

// Google
const CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post("/google", async(req, res) => {
    let token = req.body.token;

    let googleUser = await verify(token).catch(err => {
        return res.status(403).json({
            ok: false,
            mensaje: "Token no válido"
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "No se encontró el usuario",
                err: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe usar su atenticación normal"
                });
            } else {
                let token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400
                });

                return res.status(200).json({
                    ok: true,
                    mensaje: "Credenciales correctas",
                    usuarioDB: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                });
            }
        } else {
            // El usuario no existe, hay que crearlo
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.correo = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ":)";

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No se pudo guardar el usuario',
                        err
                    });
                } else {
                    let token = jwt.sign({ usuario: usuarioDB }, SEED, {
                        expiresIn: 14400
                    });

                    return res.status(200).json({
                        ok: true,
                        usuarioDB: usuarioDB,
                        id: usuarioDB._id,
                        token
                    });
                }
            });
        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Restuesta',
    //     googleUser
    // });
});

// ====================================
//  Autenticacion normal
// ====================================

app.post("/", (req, res) => {
    let body = req.body;

    Usuario.findOne({ correo: body.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "No se encontró el usuario",
                err: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - email",
                err: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - password",
                err: err
            });
        }

        // crear un token
        usuarioBD.password = ":)"; // quitamos la contraseña para no mandarla en el token
        let token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 });

        return res.status(200).json({
            ok: true,
            mensaje: "Credenciales correctas",
            usuarioBD: usuarioBD,
            id: usuarioBD._id,
            token: token
        });
    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Estas en login',
    //     body: body
    // });
});

module.exports = app;