const express = require("express");
const app = express();
let Hospital = require("../models/hospital");
let Medico = require("../models/medico");
let Usuario = require("../models/usuario");

// ============================================
// Busqueda por colecion
// ============================================

app.get("/coleccion/:tabla/:busqueda", (req, res) => {
    let busqueda = req.params.busqueda;
    let tabla = req.params.tabla;
    let regex = new RegExp(busqueda, "i");
    let promesa;

    switch (tabla) {
        case "usuarios":
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case "medicos":
            promesa = buscarMedicos(busqueda, regex);
            break;

        case "hospitales":
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: "Los tipos de búsquedas solo son usuarios, médicos y hospitales",
                error: { mensaje: "Tipos de tabla/colección no válido" }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

// ============================================
// Busqueda general
// ============================================

app.get("/todo/:busqueda", (req, res, next) => {
    let busqueda = req.params.busqueda;

    // creando una expreción regular insensible a mayúsculas y minusculas
    let regex = new RegExp(busqueda, "i");

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

// -----------------

function buscarHospitales(busqueda, regex) {
    return new Promise((res, rej) => {
        Hospital.find({ nombre: regex })
            .populate("usuario", "nombre correo")
            .exec((err, hospitaleBD) => {
                if (err) {
                    rej("Error ala cargar los hospitales", err);
                } else {
                    res(hospitaleBD);
                }
            });
    });
}

// --------------------

function buscarMedicos(busqueda, regex) {
    return new Promise((res, rej) => {
        Medico.find({ nombre: regex })
            .populate("usuario", "nombre correo")
            .populate("hospital")
            .exec((err, medicoBD) => {
                if (err) {
                    rej("Error ala cargar los médicos", err);
                } else {
                    res(medicoBD);
                }
            });
    });
}

// --------------------

function buscarUsuarios(busqueda, regex) {
    return new Promise((res, rej) => {
        Usuario.find({}, "nombre correo role")
            .or([{ nombre: regex }, { correo: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    rej("Error al cargar usuarios");
                } else {
                    res(usuarios);
                }
            });
    });
}

module.exports = app;