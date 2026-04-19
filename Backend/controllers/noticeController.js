import Notice from '../models/Notice.js';

export const getNotices = async (req, res) => {
  try {
    const { role } = req.user;
    console.log(`[Notice] Fetching for role: ${role}`);

    // Notices where targetRoles includes the user's role OR 'all'
    // Also include notices where targetRoles is empty (if any exist from old data)
    let filter = { 
        $or: [
            { targetRoles: { $in: [role, 'all'] } },
            { targetRoles: { $size: 0 } },
            { targetRoles: { $exists: false } }
        ]
    };
    
    // Admins and Chief Wardens can see everything
    if (role === 'admin' || role === 'chief-warden') {
      filter = {};
    }

    const notices = await Notice.find(filter)
      .populate('author', 'name role')
      .sort({ createdAt: -1 });
    
    console.log(`[Notice] Found ${notices.length} notices for ${role}`);

    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createNotice = async (req, res) => {
  try {
    console.log("[Notice] Create request body:", req.body);
    console.log("[Notice] Attached file:", req.file);

    const { title, content, priority, targetRoles, existingAttachment } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: "Title and Content are required." });
    }
    
    let attachment = undefined;
    if (req.file) {
      attachment = {
        name: req.file.originalname,
        url: `/uploads/notices/${req.file.filename}`,
        fileType: req.file.mimetype
      };
    } else if (existingAttachment) {
      try {
        attachment = JSON.parse(existingAttachment);
      } catch (e) {
        console.error("Failed to parse existing attachment:", e);
      }
    }

    // Handle targetRoles if it's sent as a string (FormData behavior)
    let processedTargetRoles = targetRoles;
    if (typeof targetRoles === 'string' && targetRoles) {
        processedTargetRoles = targetRoles.split(',').map(r => r.trim());
    } else if (!targetRoles) {
        processedTargetRoles = ['all'];
    }

    const notice = new Notice({
      title,
      content,
      priority,
      targetRoles: processedTargetRoles,
      attachment,
      author: req.user._id
    });
    
    await notice.save();
    console.log("[Notice] Created successfully:", notice._id);
    res.status(201).json(notice);
  } catch (err) {
    console.error("[Notice] Create notice error:", err);
    res.status(400).json({ 
        message: err.message,
        error: err.errors ? Object.keys(err.errors).reduce((acc, key) => {
            acc[key] = err.errors[key].message;
            return acc;
        }, {}) : undefined
    });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
