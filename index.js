const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { connectDB } = require('./DataBase/DBconection')
const { registrarUsuario, verificarCredenciales, obtenerUsuario } = require('./Controllers/Control')

const app = express()
const claveSecreta = 'Pass1234'

app.use(express.json())
app.use(cors())


app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

function validarRegistro(req, res, next) {
  const { email, password, rol, lenguage } = req.body || {}

  if (!email || !password || !rol || !lenguage) {
    return res.status(400).json({ message: 'Debes enviar email, password, rol y lenguage.' })
  }

  next()
}


function validarCredenciales(req, res, next) {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Debes enviar email y password.' })
  }

  next()
}


function validarToken(req, res, next) {
  const authorization = req.header('Authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Debes enviar un token Bearer.' })
  }

  const token = authorization.split(' ')[1]

  try {
    req.usuario = jwt.verify(token, claveSecreta)
    next()
  } catch (error) {
    res.status(401).json({ message: 'El token no es válido o expiró.' })
  }
}

app.post('/usuarios', validarRegistro, async (req, res, next) => {
  try {
    const { email, password, rol, lenguage } = req.body
    await registrarUsuario(email, password, rol, lenguage)
    res.status(201).json({ message: 'Usuario registrado con éxito.' })
  } catch (error) {
    next(error)
  }
})

app.post('/login', validarCredenciales, async (req, res, next) => {
  try {
    const { email, password } = req.body
    const usuario = await verificarCredenciales(email, password)
    const token = jwt.sign({ email: usuario.email }, claveSecreta)
    res.json({ token })
  } catch (error) {
    next(error)
  }
})

app.get('/usuarios', validarToken, async (req, res, next) => {
  try {
    const usuario = await obtenerUsuario(req.usuario.email)

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' })
    }

    res.json(usuario)
  } catch (error) {
    next(error)
  }
})


app.use((error, req, res, next) => {
  console.error('Error en el servidor:', error.message)

  if (error.code === '23505') {
    return res.status(409).json({ message: 'Ya existe un usuario con ese email.' })
  }

  res.status(error.status || 500).json({
    message: error.status ? error.message : 'Ocurrió un error en el servidor.'
  })
})

app.listen(3000, async () => {
  console.log('🟢 Servidor corriendo en http://localhost:3000')

  try {
    const hora = await connectDB()
    console.log('🟢 Base de datos conectada y funcionando a las', hora)
  } catch (error) {
    console.error('🔴 No se pudo conectar a la base de datos:', error.message)
  }
})
