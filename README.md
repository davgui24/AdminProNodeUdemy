
##  BACKEND SERVER ##

Este es un backend server que se puede usar para el inicio de cualquier proyecto

tiene los metodos para crear, actualizar, eliminar y buscar (buscar todos) usuarios.

los metodos de actualizar, eleiminar y crear requieren de un token en la url.

-- Crear usuario (post): localhost:3000/usuario?token=token
-- Actualizar usuario (put): localhost:3000/usuario/id?token=token
-- Eliminar usuario (delete): localhost:3000/usuario/id?token=token
-- Buscar usuarios (get): localhost:3000/usuario
-- Login usuario (post): localhost:3000/login


ejecutar ```npm install```