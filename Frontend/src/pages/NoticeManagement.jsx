import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  BellRing, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  User, 
  AlertCircle,
  Loader2,
  Megaphone,
  CheckCircle2,
  Paperclip,
  Download,
  FileText
} from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { cn } from "../lib/utils";
import { FormInput } from "../components/FormInput";

export function NoticeManagement() {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotices = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/notices');
      setNotices(data);
    } catch (err) {
      console.error("Failed to load notices", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const fileInputRef = React.useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const userRole = localStorage.getItem('role');
  const canManage = ['admin', 'warden', 'chief-warden'].includes(userRole);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
    targetRoles: ["all"]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('priority', formData.priority);
      data.append('targetRoles', formData.targetRoles.join(','));
      
      if (selectedFile) {
        data.append('attachment', selectedFile);
        console.log("Attached file to FormData:", selectedFile.name);
      } else if (editingNotice?.attachment) {
        // Keep existing attachment information
        data.append('existingAttachment', JSON.stringify(editingNotice.attachment));
        console.log("Attached existing attachment info to FormData");
      }

      console.log("Sending notice data:", Object.fromEntries(data.entries()));

      if (editingNotice) {
        // Simplified update: delete and re-create for now as per current logic
        await api.delete(`/notices/${editingNotice._id}`);
        await api.post('/notices', data);
      } else {
        await api.post('/notices', data);
      }
      loadNotices();
      setMessage({ type: "success", text: editingNotice ? "Notice updated successfully!" : "Notice created successfully!" });
      setFormData({ title: "", content: "", priority: "medium", targetRoles: ["all"] });
      setSelectedFile(null);
      setIsModalOpen(false);
      setEditingNotice(null);
    } catch (err) {
      console.error("Save notice error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to save notice";
      const validationErrors = err.response?.data?.error;
      const details = validationErrors ? ": " + Object.values(validationErrors).join(", ") : "";
      
      setMessage({ type: "error", text: errorMsg + details });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      loadNotices();
      setMessage({ type: "success", text: "Notice deleted successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete notice" });
    }
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setSelectedFile(null);
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority,
      targetRoles: notice.targetRoles
    });
    setIsModalOpen(true);
  };

  const getAttachmentUrl = (url) => {
    if (!url) return "#";
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${backendUrl}${url}`;
  };

  return (
        <div className="px-3 py-4 sm:px-5 sm:py-6 md:px-6 md:py-6 mx-auto max-w-7xl w-full relative min-h-[calc(100vh-4rem)] space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notice Board</h1>
          <p className="text-muted-foreground mt-1">
            Manage system-wide announcements and notifications.
          </p>
        </div>
        
        {canManage && (
          <button
            onClick={() => {
              setEditingNotice(null);
              setFormData({ title: "", content: "", priority: "medium", targetRoles: ["all"] });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Add New Notice
          </button>
        )}
      </div>

      {message.text && (
        <div className={cn(
          "p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2",
          message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-destructive/10 border-destructive/20 text-destructive"
        )}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="animate-spin text-primary opacity-50" />
          <p className="text-muted-foreground animate-pulse">Fetching latest notices...</p>
        </div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <div key={notice._id} className="glass-card group overflow-hidden border-border/50 hover:border-primary/30 transition-all flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge status={notice.priority} className="uppercase text-[10px] tracking-wider" />
                  {canManage && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(notice)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(notice._id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {notice.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                  {notice.content}
                </p>
              </div>
              
              <div className="px-5 py-3 bg-muted/30 border-t border-border/50">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                  <div className="flex items-center gap-1.5">
                    <User size={12} />
                    <span>{notice.author?.name || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {notice.attachment && (
                  <a
                    href={getAttachmentUrl(notice.attachment.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[11px] text-primary hover:underline mt-1 group/att"
                  >
                    <FileText size={12} className="shrink-0" />
                    <span className="truncate flex-1">{notice.attachment.name}</span>
                    <Download size={11} className="shrink-0 opacity-60 group-hover/att:opacity-100" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Megaphone size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No notices yet</h3>
          <p className="text-muted-foreground max-w-xs mt-1">
            When {canManage ? "you post" : "the administrator posts"} a notice, it will appear here for everyone to see.
          </p>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Megaphone className="text-primary" size={20} />
                {editingNotice ? "Edit Notice" : "Create New Notice"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <FormInput 
                label="Notice Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Mess Timing Changed"
                required
              />
              
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Content</label>
                <textarea 
                  className="w-full min-h-[150px] p-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Type the announcement details here..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Priority</label>
                  <select 
                    className="w-full p-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Target Audience</label>
                  <select 
                    className="w-full p-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    value={formData.targetRoles[0]}
                    onChange={(e) => setFormData({...formData, targetRoles: [e.target.value]})}
                  >
                    <option value="all">Everyone</option>
                    <option value="student">Students Only</option>
                    <option value="staff">Staff Only</option>
                    <option value="warden">Wardens Only</option>
                  </select>
                </div>
              </div>

              {/* File Attachment */}
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Attach File <span className="text-muted-foreground font-normal">(optional)</span></label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground"
                >
                  <Paperclip size={16} className="shrink-0" />
                  {selectedFile ? (
                    <span className="text-foreground font-medium truncate">{selectedFile.name}</span>
                  ) : editingNotice?.attachment ? (
                    <span className="truncate">Current: {editingNotice.attachment.name} &nbsp;(click to replace)</span>
                  ) : (
                    <span>Click to attach a file (PDF, image, doc...)</span>
                  )}
                </button>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-xs text-destructive hover:underline ml-1"
                  >
                    Remove attachment
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-border font-bold rounded-xl hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Megaphone size={18} />}
                  {editingNotice ? "Update Notice" : "Post Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
