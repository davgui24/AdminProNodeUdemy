const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mdAutenticacion = require('../middlewares/autenticacion');

const Usuario = require("../models/usuario");

const app = express();


// ==============================================
// Obtener todos los usuarios
// ==============================================

app.get("/", (req, res, next) => {

    // Si viene un paramtro en la url que se llame "desde" lo guarde, sino, le asigne un 0
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, "nombre email img role")
        .skip(desde) //salte el numero de registros de valor desde
        .limit(5)
        .exec((err, usuariosBD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al cargar el usuario",
                    errors: err
                });
            }


            Usuario.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    usuarios: usuariosBD,
                    conteo: conteo
                });
            });
        });
});



// ++++++++++++++++



// ==============================================
// Actualizar usuario
// ==============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Usuario.findById(id, (error, usuarioBD) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el usuario",
                error: error
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe el usuario con el id " + id,
                error: { mensaje: 'No existe un usuario con ese id' }
            });
        } else {

            usuarioBD.nombre = body.nombre;
            usuarioBD.email = body.email;
            usuarioBD.role = body.role;

            usuarioBD.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error al actualizar el usuario",
                        err: err
                    });
                }
                // Par no postrar la contraseña en la base de datos
                usuarioGuardado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado,
                    // usuarioToken devuelve el  usuario que actualiza
                    usuarioToken: req.usuario
                });

            });
        }

    });
});




// ==============================================
// Crear un nuevo usuario
// ==============================================

app.post("/", (req, res) => {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        correo: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear el usuario",
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            // usuarioToken devuelve el  usuario que crea
            usuarioToken: req.usuario
        });
    });
});




// ==============================================
// Borrar un usuario por id
// ==============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                err: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario cin ese id',
                err: { message: 'No existe un usuario cin ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuarioBorrado: usuarioBorrado,
            // usuarioToken devuelve el  usuario que borra
            usuarioToken: req.usuario
        });

    });
});

module.exports = app;