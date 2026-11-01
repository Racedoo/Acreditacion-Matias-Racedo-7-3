
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const path = require('path');

// Middleware
app.use(express.json());
app.use(cors());

// Servir archivos estáticos desde "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.send('¡Bienvenido al servidor!');
});

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'atlas_tech'
});

// Conectar a MySQL
db.connect(err => {
    if (err) {
        console.error('Error de conexión a MySQL:', err);
    } else {
        console.log('Conectado a MySQL 🟢');
    }
});

// Endpoint para registrar una consulta
app.post('/api/consulta', (req, res) => {
    const {
        nombre,
        tipo_problema,
        nivel_urgencia,
        problema
    } = req.body;

    // Validar los campos
    if (!nombre || !tipo_problema || !nivel_urgencia || !problema) {
        return res.status(400).json({
            error: 'Todos los campos son obligatorios'
        });
    }

    // 1. Insertar el cliente
    const sqlCliente = `
        INSERT INTO cliente (nombre)
        VALUES (?)
    `;

    db.query(sqlCliente, [nombre], (err, resultadoCliente) => {
        if (err) {
            console.error('Error al insertar cliente:', err);
            return res.status(500).json({
                error: 'Error al registrar el cliente'
            });
        }

        // Obtener la clave primaria del cliente
        const idCliente = resultadoCliente.insertId;

        // 2. Insertar el problema con la clave foránea
        const sqlProblema = `
            INSERT INTO problema
            (id_cliente, tipo_problema, nivel_urgencia, problema)
            VALUES (?, ?, ?, ?)
        `;

        const valoresProblema = [
            idCliente,
            tipo_problema,
            nivel_urgencia,
            problema
        ];

        db.query(sqlProblema, valoresProblema, (err, resultadoProblema) => {
            if (err) {
                console.error('Error al insertar problema:', err);
                return res.status(500).json({
                    error: 'Error al registrar el problema'
                });
            }

            // Responder cuando ambas inserciones finalizaron
            res.status(201).json({
                message: 'Consulta registrada exitosamente',
                id_cliente: idCliente,
                id_problema: resultadoProblema.insertId
            });
        });
    });
});

// Endpoint para login
app.post('/api/login', (req, res) => {
    const {usuario, password } = req.body;
    // Validar los campos
    if (!usuario || !password) {
        return res.status(400).json({
            error: 'Todos los campos son obligatorios'
        });
    }
});


// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

module.exports = db;
