const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

//Variables para crear esquemas de la bd
let Schema = mongoose.Schema;

//Para definir los roles
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

const usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'Debe introducir el nombre'] },
    correo: { type: String, unique: true, required: [true, 'Debe introducir el correo'] },
    password: { type: String, required: [true, 'Debe introducir la contraseña'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);