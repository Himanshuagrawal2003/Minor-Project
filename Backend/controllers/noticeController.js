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
    const { title, content, priority, targetRoles, attachment } = req.body;
    const notice = new Notice({
      title,
      content,
      priority,
      targetRoles,
      attachment,
      author: req.user._id
    });
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
