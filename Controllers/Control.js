const bcrypt = require('bcrypt')
const { pool } = require('../DataBase/DBconection')


async function registrarUsuario(email, password, rol, lenguage) {
  const passwordEncriptada = await bcrypt.hash(password, 10)

  await pool.query(
    'INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4)',
    [email, passwordEncriptada, rol, lenguage]
  )
}


async function verificarCredenciales(email, password) {
  const resultado = await pool.query(
    'SELECT id, email, password, rol, lenguage FROM usuarios WHERE email = $1',
    [email]
  )

  if (resultado.rowCount === 0) {
    const error = new Error('Usuario no registrado.')
    error.status = 404
    throw error
  }

  const usuario = resultado.rows[0]
  const passwordCorrecta = await bcrypt.compare(password, usuario.password)

  if (!passwordCorrecta) {
    const error = new Error('Contraseña incorrecta.')
    error.status = 401
    throw error
  }

  return usuario
}


async function obtenerUsuario(email) {
  const resultado = await pool.query(
    'SELECT id, email, rol, lenguage FROM usuarios WHERE email = $1',
    [email]
  )

  return resultado.rows[0]
}

module.exports = { registrarUsuario, verificarCredenciales, obtenerUsuario }
