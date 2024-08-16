const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection
const uri = 'mongodb+srv://gowsi:ncXEU2J3puENS6Bl@cluster0.plrul.mongodb.net/'; // Replace with your MongoDB Atlas connection string
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db, formsCollection;

// Connect to MongoDB Atlas and set up the collection reference
client
  .connect()
  .then(() => {
    db = client.db('formbuilder'); // Replace 'formbuilder' with your actual database name
    formsCollection = db.collection('forms'); // 'forms' is the collection name
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB Atlas:', err);
  });

// Routes

// Get all forms
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await formsCollection.find({}).toArray();
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single form by ID
app.get('/api/forms/:id', async (req, res) => {
  try {
    const form = await formsCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new form
app.post('/api/forms', async (req, res) => {
  const { title, fields } = req.body;

  console.log(req.body);

  // Basic validation to ensure title and fields are provided
  if (!title || !Array.isArray(fields) || fields.length === 0) {
    return res.status(400).json({ error: 'Title and fields are required' });
  }

  try {
    const result = await formsCollection.insertOne({ title, fields });
    // Return the inserted document with its _id
    res.status(201).json({ _id: result.insertedId, title, fields });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create form' });
  }
});

// Update an existing form by ID
app.put('/api/forms/:id', async (req, res) => {
  const { title, fields } = req.body;

  // Basic validation to ensure title and fields are provided
  if (!title || !Array.isArray(fields) || fields.length === 0) {
    return res.status(400).json({ error: 'Title and fields are required' });
  }

  try {
    const result = await formsCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, fields } },
      { returnDocument: 'after' }
    );
    if (!result.value) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(result.value);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update form' });
  }
});

// Delete a form by ID
app.delete('/api/forms/:id', async (req, res) => {
  try {
    const result = await formsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
