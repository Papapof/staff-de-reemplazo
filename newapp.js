const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const PORT = process.env.PORT || 3000;

// Ruta para cargar el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/nuevoindex.html');
  });

// Conectarse a la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/mongodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión'));
db.once('open', () => {
  console.log('Conexión exitosa');
});
const curriculumSchema = new mongoose.Schema({
    nombre: String,
    telefono: Number,
    email: String,
    experiencia: String,
    habilidades: [String],
    cargo: String,
    educacion: [String], // Cambiado a un array para almacenar múltiples recintos de educación
    idoneidad: Number,
  });

  const Curriculum = mongoose.model('Curriculum', curriculumSchema);

  // Middleware para analizar JSON y formularios URL-encoded
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Ruta para guardar un nuevo currículum con habilidades y educación
  app.post('/api/registrar-curriculum', async (req, res) => {
    try {
      const { nombre, telefono, email, experiencia, habilidades, cargo, educacion } = req.body;

      // Calcular la puntuación de idoneidad basada en las habilidades seleccionadas
      const puntuacionHabilidades = habilidades.reduce((total, habilidad) => {
        switch (habilidad) {
        case 'sony vegas':
        case 'adobe photoshop':
            return total + 1;
        case 'adobe premiere':
            return total + 2;
        case 'visual studio code':
            return total + 15;
        case 'ruby':
            return total + 4;
        case 'c++':
            return total + 20;
        case 'java':
            return total + 15;
        case 'javascript':
            return total + 15;
        case 'python':
            return total + 30;
        case 'c':
            return total + 15;
        case 'assembly':
            return total + 6;
        case 'netbeans':
            return total + 10;
        case 'mongodb':
            return total + 25;
        case 'mysql':
            return total + 30;
          default:
            return total;
        }
      }, 0);

      // Calcular la puntuación de idoneidad total
      const puntuacionPorRecinto = 5;
      const puntuacionEducacion = educacion.length * puntuacionPorRecinto;
      const idoneidad = puntuacionHabilidades + experiencia.length + puntuacionEducacion;

      const newCurriculum = new Curriculum({
        nombre,
        telefono,
        email,
        experiencia,
        habilidades,
        cargo,
        educacion,
        idoneidad,
      });
      await newCurriculum.save();
      res.status(201).json(newCurriculum);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  app.get('/curriculums', async (req, res) => {
    try {
      const candidatosOrdenados = await Curriculum.find().sort({ idoneidad: -1 }).exec();
      res.render('curriculums', { curriculums: candidatosOrdenados });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Establece EJS como el motor de plantillas
  app.set('view engine', 'ejs');

  app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
  });
