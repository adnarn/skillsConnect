import Contact from '../models/Contact.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      userId: req.user?.id
    });
    
    await contact.save();
    
    res.status(201).json({ message: 'Complaint submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
