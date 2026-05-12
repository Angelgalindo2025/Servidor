const express = require('express');
const pool = require('./db');

// MongoDB
const connectMongoDB = require('./mongoConnection');
const Vehiculo = require('./Vehiculo');

const app = express();
app.use(express.json());

// Conexión MongoDB
connectMongoDB();

// =====================================
// API FUNCIONANDO
// =====================================
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// =====================================
// GET TODOS LOS ALUMNOS ACTIVOS
// =====================================
app.get('/api/getAlumnos', async (req, res) => {
  try {

    const resultado = await pool.query(
      'SELECT * FROM alumno WHERE isActive = true'
    );

    res.status(200).json({
      message: 'Alumnos encontrados correctamente',
      data: resultado.rows
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al obtener alumnos',
      error: error.message
    });

  }
});

// =====================================
// GET ALUMNO POR ID
// =====================================
app.get('/api/getAlumnoById/:id', async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'El id es obligatorio'
      });
    }

    if (isNaN(id)) {
      return res.status(400).json({
        message: 'El id debe ser numérico'
      });
    }

    const resultado = await pool.query(
      'SELECT * FROM alumno WHERE id = $1 AND isActive = true',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        message: 'Alumno no encontrado'
      });
    }

    res.status(200).json({
      message: 'Alumno encontrado correctamente',
      data: resultado.rows[0]
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al obtener alumno',
      error: error.message
    });

  }
});

// =====================================
// BUSCAR ALUMNO CON LIKE
// =====================================
app.get('/api/searchAlumno', async (req, res) => {
  try {

    const { query } = req.query;

    // Validar búsqueda
    if (!query || query.trim() === '') {
      return res.status(400).json({
        message: 'La búsqueda es obligatoria'
      });
    }

    const resultado = await pool.query(
      `SELECT * FROM alumno
       WHERE (nombre LIKE $1 OR apellido LIKE $1)
       AND isActive = true`,
      [`%${query}%`]
    );

    res.status(200).json({
      message: 'Búsqueda realizada correctamente',
      data: resultado.rows
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al buscar alumnos',
      error: error.message
    });

  }
});

// =====================================
// CREAR ALUMNO
// =====================================
app.post('/api/createAlumno', async (req, res) => {
  try {

    const { nombre, apellido, edad, correo } = req.body;

    if (!nombre || !apellido || !edad || !correo) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO alumno
      (nombre, apellido, edad, correo)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [nombre, apellido, edad, correo]
    );

    res.status(201).json({
      message: 'Alumno creado correctamente',
      data: resultado.rows[0]
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al crear alumno',
      error: error.message
    });

  }
});

// =====================================
// ACTUALIZAR ALUMNO
// =====================================
app.put('/api/updateAlumno/:id', async (req, res) => {
  try {

    const { id } = req.params;
    const { nombre, apellido, edad, correo } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        message: 'El id debe ser numérico'
      });
    }

    const alumnoExiste = await pool.query(
      'SELECT * FROM alumno WHERE id = $1 AND isActive = true',
      [id]
    );

    if (alumnoExiste.rows.length === 0) {
      return res.status(404).json({
        message: 'Alumno no encontrado'
      });
    }

    const resultado = await pool.query(
      `UPDATE alumno
       SET nombre = $1,
           apellido = $2,
           edad = $3,
           correo = $4
       WHERE id = $5
       RETURNING *`,
      [nombre, apellido, edad, correo, id]
    );

    res.status(200).json({
      message: 'Alumno actualizado correctamente',
      data: resultado.rows[0]
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al actualizar alumno',
      error: error.message
    });

  }
});

// =====================================
// DELETE LÓGICO
// =====================================
app.delete('/api/deleteAlumno/:id', async (req, res) => {
  try {

    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        message: 'El id debe ser numérico'
      });
    }

    const alumnoExiste = await pool.query(
      'SELECT * FROM alumno WHERE id = $1 AND isActive = true',
      [id]
    );

    if (alumnoExiste.rows.length === 0) {
      return res.status(404).json({
        message: 'Alumno no encontrado'
      });
    }

    await pool.query(
      'UPDATE alumno SET isActive = false WHERE id = $1',
      [id]
    );

    res.status(200).json({
      message: 'Alumno eliminado correctamente'
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al eliminar alumno',
      error: error.message
    });

  }
});

// =====================================
// GET MATERIAS
// =====================================
app.get('/api/getMaterias', async (req, res) => {
  try {

    const resultado = await pool.query('SELECT * FROM materia');

    res.status(200).json({
      message: 'Materias encontradas correctamente',
      data: resultado.rows
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al consultar materias',
      error: error.message
    });

  }
});

// =====================================
// CREAR MATERIA
// =====================================
app.post('/api/createMateria', async (req, res) => {
  try {

    const { nombre, semestre, creditos } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        message: 'El nombre es obligatorio'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO materia
      (nombre, semestre, creditos)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [nombre, semestre, creditos]
    );

    res.status(201).json({
      message: 'Materia creada correctamente',
      data: resultado.rows[0]
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al crear materia',
      error: error.message
    });

  }
});
// =====================================
// CONSULTAR MATERIAS POR ALUMNO
// =====================================
app.get('/api/getMateriasByAlumnoId/:id', async (req, res) => {
  try {

    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        message: 'El id debe ser numérico'
      });
    }

    const resultado = await pool.query(
      `SELECT materia.*
       FROM alumno_materia
       INNER JOIN materia
       ON alumno_materia.materia_id = materia.id
       WHERE alumno_materia.alumno_id = $1`,
      [id]
    );

    res.status(200).json({
      message: 'Materias encontradas correctamente',
      data: resultado.rows
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al consultar materias del alumno',
      error: error.message
    });

  }
});

// =====================================
// CONTAR MATERIAS POR ALUMNO
// =====================================
app.get('/api/getMateriasCountByAlumnoId/:id', async (req, res) => {
  try {

    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        message: 'El id debe ser numérico'
      });
    }

    const resultado = await pool.query(
      `SELECT COUNT(*) AS total_materias
       FROM alumno_materia
       WHERE alumno_id = $1`,
      [id]
    );

    res.status(200).json({
      total_materias: resultado.rows[0].total_materias
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al contar materias',
      error: error.message
    });

  }
});

// =====================================
// GET VEHICULOS
// =====================================
app.get('/api/getVehiculos', async (req, res) => {
  try {

    const vehiculos = await Vehiculo.find();

    res.status(200).json({
      message: 'Vehículos encontrados correctamente',
      data: vehiculos,
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al consultar vehículos',
      error: error.message,
    });

  }
});

// =====================================
// CREATE VEHICULO
// =====================================
app.post('/api/createVehiculo', async (req, res) => {
  try {

    const { marca, modelo, anio, color } = req.body;

    if (!marca || !modelo || !anio || !color) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios',
      });
    }

    if (isNaN(anio)) {
      return res.status(400).json({
        message: 'El año debe ser numérico',
      });
    }

    const nuevoVehiculo = new Vehiculo({
      marca,
      modelo,
      anio,
      color,
    });

    await nuevoVehiculo.save();

    res.status(201).json({
      message: 'Vehículo creado correctamente',
      data: nuevoVehiculo,
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al crear vehículo',
      error: error.message,
    });

  }
});

// =====================================
// ASIGNAR MATERIA A ALUMNO
// =====================================
app.post('/api/assignMateriaToAlumno', async (req, res) => {
  try {

    const { alumno_id, materia_id } = req.body;

    if (!alumno_id || !materia_id) {
      return res.status(400).json({
        message: 'alumno_id y materia_id son obligatorios'
      });
    }

    if (isNaN(alumno_id) || isNaN(materia_id)) {
      return res.status(400).json({
        message: 'Los ids deben ser numéricos'
      });
    }

    const resultado = await pool.query(
      `INSERT INTO alumno_materia
      (alumno_id, materia_id)
      VALUES ($1, $2)
      RETURNING *`,
      [alumno_id, materia_id]
    );

    res.status(201).json({
      message: 'Materia asignada correctamente',
      data: resultado.rows[0]
    });

  } catch (error) {

    res.status(500).json({
      message: 'Error al asignar materia',
      error: error.message
    });

  }
});


// =====================================
// SERVIDOR
// =====================================
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});