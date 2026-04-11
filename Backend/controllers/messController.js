import MessMenu from '../models/MessMenu.js';
import User from '../models/User.js';
import Mess from '../models/Mess.js';

// Mess Model CRUD
export const createMess = async (req, res) => {
  try {
    const { messId, name, description, location, capacity } = req.body;
    const mess = new Mess({ messId, name, description, location, capacity });
    await mess.save();
    res.status(201).json(mess);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMesses = async (req, res) => {
  try {
    const messes = await Mess.find().sort({ name: 1 });
    res.json(messes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMess = async (req, res) => {
  try {
    const { id } = req.params;
    const { messId, name, description, location, capacity, isActive } = req.body;
    const mess = await Mess.findByIdAndUpdate(
      id, 
      { messId, name, description, location, capacity, isActive },
      { new: true }
    );
    if (!mess) return res.status(404).json({ message: "Mess not found" });
    res.json(mess);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteMessInstance = async (req, res) => {
  try {
    const { id } = req.params;
    const mess = await Mess.findByIdAndDelete(id);
    if (!mess) return res.status(404).json({ message: "Mess not found" });
    res.json({ message: "Mess deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllMesses = async (req, res) => {
  try {
    // Return unique mess IDs from the menu system
    const menuMesses = await MessMenu.distinct('messId');
    res.json(menuMesses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMenu = async (req, res) => {
  try {
    const { messId } = req.query;
    const filter = messId ? { messId } : {};
    const menu = await MessMenu.find(filter);
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const { messId, day, meals } = req.body;
    const menu = await MessMenu.findOneAndUpdate(
      { messId: messId || 'Default Mess', day },
      { meals, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(menu);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTodayMenu = async (req, res) => {
  try {
    const { messId } = req.query;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    // Improved robust searching
    let menu = null;
    if (messId) {
      // 1. Try exact match
      menu = await MessMenu.findOne({ day: today, messId: messId });
      
      // 2. Try case-insensitive exact match
      if (!menu) {
        menu = await MessMenu.findOne({ 
          day: today, 
          messId: { $regex: new RegExp(`^${messId.trim()}$`, 'i') } 
        });
      }
      
      // 3. Try variations (spaces vs dashes)
      if (!menu) {
        const variation = messId.includes('-') ? messId.replace(/-/g, ' ') : messId.replace(/ /g, '-');
        menu = await MessMenu.findOne({ 
          day: today, 
          messId: { $regex: new RegExp(`^${variation.trim()}$`, 'i') } 
        });
      }
    }

    // 4. Default fallback
    if (!menu) {
      menu = await MessMenu.findOne({ 
        day: today, 
        messId: { $regex: /^Default Mess$/i } 
      });
    }

    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMess = async (req, res) => {
  try {
    const { messId } = req.params;
    if (!messId) return res.status(400).json({ message: "Mess ID is required" });
    
    await MessMenu.deleteMany({ messId });
    res.json({ message: `Mess '${messId}' deleted successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const renameMess = async (req, res) => {
  try {
    const { oldMessId, newMessId } = req.body;
    if (!oldMessId || !newMessId) return res.status(400).json({ message: "oldMessId and newMessId required" });

    const existing = await MessMenu.findOne({ messId: newMessId });
    if (existing) {
      return res.status(400).json({ message: "A mess with this name already exists" });
    }

    await MessMenu.updateMany({ messId: oldMessId }, { messId: newMessId });
    await User.updateMany({ messId: oldMessId }, { messId: newMessId });

    res.json({ message: `Mess renamed to '${newMessId}' successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
