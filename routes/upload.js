const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const app = express();

const Usuario = require("../models/usuario");
const Hospital = require("../models/hospital");
const Medico = require("../models/medico");

app.use(fileUpload());

app.put("/:tipo/:id", (req, res, next) => {
    let tipo = req.params.tipo;
    let id = req.params.id;

    // tipos de coleccion
    let tiposValidos = ["hospitales", "medicos", "usuarios"];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Tipo de colección no es válida",
            errors: { messaje: "Tipo de colección no es válida" }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "No selecciono la imagen",
            errors: { messaje: "Debe seleccionar un archivo de imagen" }
        });
    }

    // Obtener nombre del archivo
    let archivo = req.files.imagen;
    let nombreCortado = archivo.name.split(".");
    let extencionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo estas extenciones aceptamos
    let extencionesValidas = ["png", "jpg", "gif", "jpej"];

    if (extencionesValidas.indexOf(extencionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Tipo de archivo no es válida",
            errors: {
                messaje: "las extenciones válidas son " + extencionesValidas.join(", ")
            }
        });
    }

    // nombre de archivo personalizado
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencionArchivo}`;

    // Mover el archivo del temporal a un path específico
    let path = `./upload/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al mover archivo",
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

// -------

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo == "usuarios") {
        Usuario.findById(id, (err, usuario) => {
            let pathViejoUser = "./upload/usuarios/" + usuario.img;


            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejoUser)) {
                fs.unlink(pathViejoUser, errorUsuario => {
                    if (errorUsuario) {
                        return res.status(402).json({
                            ok: false,
                            mensaje: "Nada",
                            pathViejoUser,
                            actual: usuario.img,
                            errorUsuario
                        });
                    } else {
                        usuario.img = nombreArchivo;
                        usuario.save((err, usuarioActualizado) => {
                            return res.status(200).json({
                                ok: true,
                                mensaje: "Imagen de usuario actualizada",
                                usuario: usuarioActualizado
                            });
                        });
                    }
                });
            }
        });
    }

    if (tipo == "medicos") {
        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Erro al buscar el médico"
                });
            } else {
                let pathViejoMedico = "./upload/medicos/" + medico.img;

                // Si existe elimina la imagen anterior
                if (fs.existsSync(pathViejoMedico)) {
                    fs.unlink(pathViejoMedico, errMedico => {
                        if (errMedico) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: "No se pudo actualizar la imagen",
                                pathViejoMedico,
                                nuevo: medico.img,
                                errMedico
                            });
                        } else {
                            medico.img = nombreArchivo;
                            medico.save((err, medicoActualizado) => {
                                return res.status(200).json({
                                    ok: true,
                                    mensaje: "Imagen de médico actualizada",
                                    medico: medicoActualizado
                                });
                            });
                        }
                    });
                }
            }
        });
    }

    if (tipo == "hospitales") {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Erro al buscar el médico"
                });
            } else {
                let pathViejoHospital = "./upload/hospitales/" + hospital.img;

                // Si existe elimina la imagen anterior
                if (fs.existsSync(pathViejoHospital)) {
                    fs.unlink(pathViejoHospital, errHospital => {
                        if (errHospital) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: "No se pudo actualizar la imagen",
                                pathViejoHospital,
                                nuevo: hospital.img,
                                errHospital
                            });
                        } else {
                            hospital.img = nombreArchivo;
                            hospital.save((err, hospitalActualizado) => {
                                return res.status(200).json({
                                    ok: true,
                                    mensaje: "Imagen de hospital actualizada",
                                    medico: hospitalActualizado
                                });
                            });
                        }
                    });
                }
            }
        });
    }
}

module.exports = app;