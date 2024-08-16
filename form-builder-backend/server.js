const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/formbuilder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Mongoose Schema for Form
const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fields: [
    {
      type: { type: String, required: true },
      title: { type: String, required: true },
      placeholder: { type: String, required: true },
      inputType: { type: String, required: true },
    },
  ],
});

const Form = mongoose.model('Form', FormSchema);

// Routes

// Get all forms
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await Form.find({});
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single form by ID
app.get('/api/forms/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
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
  try {
    const newForm = new Form({ title, fields });
    await newForm.save();
    res.status(201).json(newForm);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: 'Failed to create form' });
  }
});

// Update an existing form by ID
app.put('/api/forms/:id', async (req, res) => {
  const { title, fields } = req.body;
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { title, fields },
      { new: true }
    );
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update form' });
  }
});

// Delete a form by ID (Optional)
app.delete('/api/forms/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
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
