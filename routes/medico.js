const express = require("express");

const mdAutenticacion = require('../middlewares/autenticacion');

const Medico = require("../models/medico");

const app = express();


// ==============================================
// Obtener todos los medico
// ==============================================

app.get("/", (req, res, next) => {

    // Si viene un paramtro en la url que se llame "desde" lo guarde, sino, le asigne un 0
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .populate('usuario', ('nombre correo'))
        .populate('hospital')
        .skip(desde) //salte el numero de registros de valor desde
        .limit(5)
        .exec((err, medicoBD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al cargar el medico",
                    errors: err
                });
            }


            Medico.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    medico: medicoBD,
                    conteo: conteo
                });
            });

        });
});



// ++++++++++++++++



// ==============================================
// Actualizar medico
// ==============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Medico.findById(id, (error, medicoBD) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el medico",
                error: error
            });
        }

        if (!medicoBD) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe el medico con el id " + id,
                error: { mensaje: 'No existe un medico con ese id' }
            });
        } else {

            medicoBD.nombre = body.nombre;
            medicoBD.usuario = req.usuario._id;
            medicoBD.hospital = body.hospital;

            medicoBD.save((err, medicoGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error al actualizar el medico",
                        err: err
                    });
                }


                return res.status(200).json({
                    ok: true,
                    medico: medicoGuardado,
                });

            });
        }

    });
});




// ==============================================
// Crear un nuevo medico
// ==============================================

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    let body = req.body;
    let medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear el medico",
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});




// ==============================================
// Borrar un medico por id
// ==============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                err: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                err: { message: 'No existe un medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medicoBorrado: medicoBorrado,
            usuario: req.usuario
        });

    });
});

module.exports = app;