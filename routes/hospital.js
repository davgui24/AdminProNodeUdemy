const express = require("express");

const mdAutenticacion = require('../middlewares/autenticacion');

const Hospital = require("../models/hospital");

const app = express();


// ==============================================
// Obtener todos los hospitales
// ==============================================

app.get("/", (req, res, next) => {

    // Si viene un paramtro en la url que se llame "desde" lo guarde, sino, le asigne un 0
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', ('nombre correo'))
        .skip(desde) //salte el numero de registros de valor desde
        .limit(5)
        .exec((err, hospitalesBD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al cargar el hospital",
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    hospitales: hospitalesBD,
                    conteo: conteo
                });
            });
        });
});



// ++++++++++++++++



// ==============================================
// Actualizar hospital
// ==============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Hospital.findById(id, (error, hospitalBD) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el hospital",
                error: error
            });
        }

        if (!hospitalBD) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe el hospital con el id " + id,
                error: { mensaje: 'No existe un hospital con ese id' }
            });
        } else {

            hospitalBD.nombre = body.nombre;
            hospitalBD.usuario = req.usuario._id;

            hospitalBD.save((err, hospitalGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Error al actualizar el hospital",
                        err: err
                    });
                }


                return res.status(200).json({
                    ok: true,
                    hospital: hospitalGuardado,
                    // hospitalToken devuelve el  hospital que actualiza
                    hospitalToken: req.usuario
                });

            });
        }

    });
});




// ==============================================
// Crear un nuevo hospital
// ==============================================

app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    let body = req.body;
    let hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear el hospital",
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});




// ==============================================
// Borrar un hospital por id
// ==============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                err: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                err: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospitalBorrado: hospitalBorrado,
            usuario: req.usuario
        });

    });
});

module.exports = app;