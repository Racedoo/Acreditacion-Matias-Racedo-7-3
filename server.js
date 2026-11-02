
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

// Autenticación simple
let sesionIniciada = false;

function verificarSesion(req, res, next) {
    if (!sesionIniciada) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
}

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
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const sql = 'SELECT * FROM login WHERE usuario = ? AND contraseña = ?';

    db.query(sql, [usuario, contraseña], (err, resultado) => {
        if (err) {
            console.error('Error en login:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }

        if (resultado.length === 0) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        sesionIniciada = true;
        res.json({ message: 'Login correcto' });
    });
});

// Endopoint para problemas

app.get('/api/problemas', verificarSesion, (req, res) => {
    const sql = `
        SELECT p.id_problema, c.nombre, p.tipo_problema, p.nivel_urgencia,
               p.problema, p.leida, p.fecha
        FROM problema p
        INNER JOIN cliente c ON c.id_cliente = p.id_cliente
        ORDER BY p.fecha DESC
    `;

    db.query(sql, (err, resultado) => {
        if (err) {
            console.error('Error al obtener problemas:', err);
            return res.status(500).json({ error: 'Error al obtener los problemas' });
        }
        res.json(resultado);
    });
});

// Endpoint para cambiar el estadod e un problema a leída o no leída

app.put('/api/problemas/:id/leida', verificarSesion, (req, res) => {
    const { leida } = req.body;
    const sql = 'UPDATE problema SET leida = ? WHERE id_problema = ?';

    db.query(sql, [leida, req.params.id], (err) => {
        if (err) {
            console.error('Error al actualizar estado:', err);
            return res.status(500).json({ error: 'Error al actualizar' });
        }
        res.json({ message: 'Estado actualizado' });
    });
});


// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

module.exports = db;
