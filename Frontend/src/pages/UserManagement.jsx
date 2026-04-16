import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  FileSpreadsheet,
  Upload,
  Download,
  Check,
  AlertCircle,
  Loader2,
  UserCheck,
  ShieldCheck,
  Mail,
  BookOpen,
  Building,
  Copy,
  ExternalLink,
  Printer,
  Trash2,
  BedDouble,
} from "lucide-react";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { FormInput } from "../components/FormInput";
import { cn } from "../lib/utils";
import * as XLSX from "xlsx";
import { api } from "../services/api";

export function UserManagement() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("student");
  const [activeMethod, setActiveMethod] = useState("manual");

  const [users, setUsers] = useState({
    student: [],
    warden: [],
    "chief-warden": [],
    staff: [],
  });

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/users?role=${activeRole}`);
        setUsers(prev => ({ ...prev, [activeRole]: res.users }));
      } catch (err) {
        setMessage({ type: "error", text: "Failed to fetch users." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [activeRole]);

  const [formData, setFormData] = useState({ name: "", email: "", contact: "", extra: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteSearchTerm, setDeleteSearchTerm] = useState("");
  const [deleteTab, setDeleteTab] = useState("manual");
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);



  const handleManualAdd = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.post("/users/create", {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        role: activeRole,
        extra: formData.extra,
      });

      if (res.success) {
        // Refresh the list for current role
        const freshUsers = await api.get(`/users?role=${activeRole}`);
        setUsers(prev => ({ ...prev, [activeRole]: freshUsers.users }));

        setFormData({ name: "", email: "", contact: "", extra: "" });
        setMessage({
          type: "success",
          text: `Successfully created ${activeRole}. Temp Password: ${res.tempPassword}`,
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to create user." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setMessage({ type: "", text: "" });
  };

  const processBulkUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const usersToCreate = jsonData.map((row) => ({
          id: row.ID || row.Id || row.UserID || row['User ID'] || "",
          name: row.Name || row["Full Name"] || "Unknown",
          email: row.Email || row['Email Address'] || "N/A",
          contact: row.Contact || row['Contact Number'] || row.Phone || "N/A",
          extra: row.Extra || row.Course || row.Block || row.Department || row.Role || "N/A",
        }));

        const res = await api.post("/users/bulk", { users: usersToCreate, role: activeRole });

        // Refresh list
        const freshUsers = await api.get(`/users?role=${activeRole}`);
        setUsers(prev => ({ ...prev, [activeRole]: freshUsers.users }));

        setMessage({ type: "success", text: `Bulk uploaded ${res.count} ${activeRole}s successfully!` });
        setSelectedFile(null);
      } catch (err) {
        setMessage({ type: "error", text: err.message || "Failed to process bulk upload." });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const processBulkDelete = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const idsToDelete = jsonData.map((row) => row.ID || row.Id || row.UserID || row["User ID"]).filter(Boolean);

        if (idsToDelete.length === 0) {
          throw new Error("No User IDs found in the file.");
        }

        const res = await api.post("/users/bulk-delete", { ids: idsToDelete });

        // Refresh list
        const freshUsers = await api.get(`/users?role=${activeRole}`);
        setUsers(prev => ({ ...prev, [activeRole]: freshUsers.users }));

        setMessage({
          type: "success",
          text: `Successfully deleted ${res.count} accounts. ${idsToDelete.length - res.count > 0 ? `${idsToDelete.length - res.count} IDs not found.` : ""}`
        });
        setSelectedFile(null);
      } catch (err) {
        setMessage({ type: "error", text: err.message || "Failed to process bulk deletion." });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDeleteUser = async (id, mId) => {
    // Note: Backend uses mongo _id for deletion
    if (window.confirm(`Are you sure you want to delete this ${activeRole}? This action cannot be undone.`)) {
      try {
        setIsLoading(true);
        await api.delete(`/users/${mId}`);

        // Update local state
        setUsers(prev => ({
          ...prev,
          [activeRole]: prev[activeRole].filter(u => u._id !== mId)
        }));

        setMessage({ type: "success", text: "User deleted successfully." });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } catch (err) {
        setMessage({ type: "error", text: err.message || "Failed to delete user." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const downloadTemplate = () => {
    let templateData = [];
    let filename = "";

    if (activeMethod === "bulk") {
      const extraHeader = activeRole === "student" ? "Course" : activeRole === "warden" ? "Block" : activeRole === "chief-warden" ? "Department" : "Role";
      templateData = [{
        Name: "John Doe",
        Email: "john@example.com",
        Contact: "9876543210",
        [extraHeader]: activeRole === "student" ? "CSE" : activeRole === "warden" ? "Block B" : activeRole === "staff" ? "Electrician" : "Admin",
      }];
      filename = `${activeRole}_upload_template.xlsx`;
    } else {
      templateData = [{ ID: "S101" }, { ID: "W201" }];
      filename = `${activeRole}_delete_template.xlsx`;
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, filename);
  };

  const downloadAllCredentials = () => {
    if (!users[activeRole] || users[activeRole].length === 0) {
      alert("No data available to download for this role.");
      return;
    }

    const data = users[activeRole].map((u) => {
      const rowData = {
        "User ID": u.customId || u._id || "N/A",
        "Full Name": u.name || "N/A",
        "Email": u.email || "N/A",
        "Contact": u.contact || "N/A",
        "Temporary Password": u.customId || "123456",
        "Role": activeRole.toUpperCase(),
      };

      if (activeRole === "student") rowData["Course"] = u.course || "N/A";
      if (activeRole === "warden") rowData["Building Type"] = u.buildingType || "N/A";
      if (activeRole === "chief-warden") rowData["Department"] = u.department || "N/A";
      if (activeRole === "staff") rowData["Staff Role"] = u.role || "N/A";

      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(data);

    // 🔥 Auto-resize excel columns
    if (data.length > 0) {
      const colWidths = Object.keys(data[0]).map((key) => {
        const maxLength = Math.max(
          key.length,
          ...data.map((row) => (row[key] ? row[key].toString().length : 0))
        );
        return { wch: maxLength + 2 };
      });
      ws["!cols"] = colWidths;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Credentials");
    XLSX.writeFile(wb, `${activeRole}_credentials_list.xlsx`);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); };

  const columns = {
    student: [
      { header: "Student ID", accessorKey: "customId" },
      { header: "Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      { header: "Contact", accessorKey: "contact" },
      { header: "Course", accessorKey: "course" },
      {
        header: "Temp Password", accessorKey: "customId",
        cell: (row) => (
          <div className="flex items-center gap-2 group/cell">
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{row.customId}</code>
            <button onClick={() => copyToClipboard(row.customId)} className="p-1 opacity-0 group-hover/cell:opacity-100 hover:bg-muted rounded transition-all" title="Copy ID">
              <Copy size={12} className="text-muted-foreground" />
            </button>
          </div>
        ),
      },
      {
        header: "Action", accessorKey: "_id",
        cell: (row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/admin/room-allotment?studentId=${row._id}`)}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
              title="Allot Room"
            >
              <BedDouble size={16} />
            </button>
            <button
              onClick={() => handleDeleteUser(row.customId, row._id)}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              title="Delete Student"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      },
    ],
    warden: [
      { header: "Warden ID", accessorKey: "customId" },
      { header: "Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      { header: "Contact", accessorKey: "contact" },
      { header: "Building", accessorKey: "buildingType" },
      {
        header: "Temp Password", accessorKey: "customId",
        cell: (row) => (
          <div className="flex items-center gap-2 group/cell">
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{row.customId}</code>
            <button onClick={() => copyToClipboard(row.customId)} className="p-1 opacity-0 group-hover/cell:opacity-100 hover:bg-muted rounded transition-all">
              <Copy size={12} className="text-muted-foreground" />
            </button>
          </div>
        ),
      },
      {
        header: "Action", accessorKey: "_id",
        cell: (row) => (
          <button onClick={() => handleDeleteUser(row.customId, row._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Delete Warden">
            <Trash2 size={16} />
          </button>
        ),
      },
    ],
    "chief-warden": [
      { header: "ID", accessorKey: "customId" },
      { header: "Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      { header: "Contact", accessorKey: "contact" },
      { header: "Department", accessorKey: "department" },
      {
        header: "Temp Password", accessorKey: "customId",
        cell: (row) => (
          <div className="flex items-center gap-2 group/cell">
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{row.customId}</code>
            <button onClick={() => copyToClipboard(row.customId)} className="p-1 opacity-0 group-hover/cell:opacity-100 hover:bg-muted rounded transition-all">
              <Copy size={12} className="text-muted-foreground" />
            </button>
          </div>
        ),
      },
      {
        header: "Action", accessorKey: "_id",
        cell: (row) => (
          <button onClick={() => handleDeleteUser(row.customId, row._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Delete Chief Warden">
            <Trash2 size={16} />
          </button>
        ),
      },
    ],
    staff: [
      { header: "Staff ID", accessorKey: "customId" },
      { header: "Name", accessorKey: "name" },
      { header: "Contact", accessorKey: "contact" },  // lowercase — matches data key
      { header: "Role", accessorKey: "role" },          // lowercase — matches data key
      {
        header: "Temp Password", accessorKey: "customId",
        cell: (row) => (
          <div className="flex items-center gap-2 group/cell">
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{row.customId}</code>
            <button onClick={() => copyToClipboard(row.customId)} className="p-1 opacity-0 group-hover/cell:opacity-100 hover:bg-muted rounded transition-all" title="Copy ID">
              <Copy size={12} className="text-muted-foreground" />
            </button>
          </div>
        ),
      },
      {
        header: "Action", accessorKey: "_id",
        cell: (row) => (
          <button onClick={() => handleDeleteUser(row.customId, row._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Delete Staff">
            <Trash2 size={16} />
          </button>
        ),
      },
    ],
  };

  const roleConfigs = {
    student: { icon: Users, label: "Students", color: "text-blue-500", extraLabel: "Course / Year" },
    warden: { icon: UserCheck, label: "Wardens", color: "text-emerald-500", extraLabel: "Building Type (Boys/Girls)" },
    "chief-warden": { icon: ShieldCheck, label: "Chief Warden", color: "text-purple-500", extraLabel: "Department" },
    staff: { icon: Users, label: "Staff", color: "text-orange-500", extraLabel: "Role / Dept" },
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Add and manage system users across all roles.</p>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-1">
        <div className="grid grid-cols-4 sm:flex gap-1.5 p-1 bg-muted/30 rounded-xl w-full sm:w-fit border border-border/50">
          {Object.entries(roleConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => { setActiveRole(key); setMessage({ type: "", text: "" }); }}
              className={cn(
                "flex items-center justify-center sm:justify-start gap-1.5 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                activeRole === key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-muted/50",
              )}
            >
              <config.icon size={14} className={activeRole === key ? config.color : ""} />
              <span>{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1">
          <div className="glass-card overflow-hidden">
            <div className="flex border-b border-border/50">
              <button
                onClick={() => setActiveMethod("manual")}
                className={cn(
                  "flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all",
                  activeMethod === "manual" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground",
                )}
              >
                Manual Add
              </button>
              <button
                onClick={() => { setActiveMethod("bulk"); setMessage({ type: "", text: "" }); setSelectedFile(null); }}
                className={cn(
                  "flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all",
                  activeMethod === "bulk" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground",
                )}
              >
                Bulk Import
              </button>
              <button
                onClick={() => { setActiveMethod("delete"); setMessage({ type: "", text: "" }); setSelectedFile(null); }}
                className={cn(
                  "flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all",
                  activeMethod === "delete" ? "bg-destructive/5 text-destructive border-b-2 border-destructive" : "text-muted-foreground",
                )}
              >
                Delete
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {activeMethod === "manual" ? (
                <form onSubmit={handleManualAdd} className="space-y-4">
                  <FormInput
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                  <FormInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    required
                  />
                  <FormInput
                    label="Contact Number"
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="e.g. 9876543210"
                    required
                  />
                  <FormInput
                    label={roleConfigs[activeRole].extraLabel}
                    value={formData.extra}
                    onChange={(e) => setFormData({ ...formData, extra: e.target.value })}
                    placeholder={`e.g. ${activeRole === "student" ? "B.Tech IT" : activeRole === "warden" ? "Block B" : activeRole === "staff" ? "Electrician" : "Accounts"}`}
                    required
                  />
                  <button className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                    Generate ID & Add
                  </button>
                </form>
              ) : activeMethod === "bulk" ? (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className={cn(
                      "border-2 border-dashed border-border p-6 sm:p-8 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/30 transition-all group",
                      selectedFile && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx,.xls,.csv" />
                    <div className={cn("p-3 rounded-full transition-transform", selectedFile ? "bg-emerald-500/10 text-emerald-600 scale-110" : "bg-primary/10 text-primary group-hover:scale-110")}>
                      {selectedFile ? <Check size={24} /> : <Upload size={24} />}
                    </div>
                    <p className="text-sm font-semibold text-center">{selectedFile ? selectedFile.name : "Upload Excel Dataset"}</p>
                    <p className="text-xs text-muted-foreground text-center">
                      {selectedFile ? "File ready to import." : `Batch create ${activeRole} IDs and profiles automatically.`}
                    </p>
                  </div>
                  <button
                    onClick={processBulkUpload}
                    disabled={isLoading || !selectedFile}
                    className={cn(
                      "w-full py-2.5 font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm",
                      selectedFile ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground shadow-none",
                    )}
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    Import & Generate Accounts
                  </button>
                  <button onClick={downloadTemplate} className="w-full py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted flex items-center justify-center gap-2">
                    <Download size={16} /> Download CSV Template
                  </button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex p-1 bg-muted/50 rounded-xl border border-border/50">
                    <button
                      onClick={() => { setDeleteTab("manual"); setMessage({ type: "", text: "" }); }}
                      className={cn("flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all", deleteTab === "manual" ? "bg-background text-destructive shadow-sm" : "text-muted-foreground")}
                    >
                      Manual
                    </button>
                    <button
                      onClick={() => { setDeleteTab("bulk"); setMessage({ type: "", text: "" }); setSelectedFile(null); }}
                      className={cn("flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all", deleteTab === "bulk" ? "bg-background text-destructive shadow-sm" : "text-muted-foreground")}
                    >
                      Bulk
                    </button>
                  </div>

                  {deleteTab === "manual" ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder={`Search ${activeRole} name/ID...`}
                          value={deleteSearchTerm}
                          onChange={(e) => setDeleteSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-destructive/20 outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {users[activeRole].filter(
                          (u) =>
                            u.name.toLowerCase().includes(deleteSearchTerm.toLowerCase()) ||
                            u.id.toLowerCase().includes(deleteSearchTerm.toLowerCase()),
                        ).length > 0 ? (
                          users[activeRole]
                            .filter((u) =>
                              u.name.toLowerCase().includes(deleteSearchTerm.toLowerCase()) ||
                              u.id.toLowerCase().includes(deleteSearchTerm.toLowerCase()),
                            )
                            .map((u) => (
                              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-destructive/5 transition-all group">
                                <div>
                                  <p className="text-xs font-bold">{u.name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase">{u.id}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u._id)}
                                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                  <Check size={16} />
                                </button>
                              </div>
                            ))
                        ) : (
                          <p className="text-center py-8 text-[10px] text-muted-foreground uppercase tracking-widest">No users found</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div
                        onClick={() => fileInputRef.current.click()}
                        className={cn(
                          "border-2 border-dashed border-border p-6 sm:p-8 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-destructive/5 hover:border-destructive/50 transition-all group",
                          selectedFile && "border-destructive/40 bg-destructive/5",
                        )}
                      >
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".xlsx,.xls,.csv" />
                        <div className={cn("p-3 rounded-full transition-transform", selectedFile ? "bg-destructive/10 text-destructive scale-110" : "bg-destructive/10 text-destructive group-hover:scale-110")}>
                          {selectedFile ? <Check size={24} /> : <Trash2 size={24} />}
                        </div>
                        <p className="text-sm font-semibold text-center">{selectedFile ? selectedFile.name : `Bulk Delete ${activeRole}s`}</p>
                        <p className="text-xs text-muted-foreground text-center">Upload Excel with User IDs to remove accounts in batch.</p>
                      </div>
                      <button
                        onClick={processBulkDelete}
                        disabled={isLoading || !selectedFile}
                        className={cn(
                          "w-full py-2.5 font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm",
                          selectedFile ? "bg-destructive text-white hover:bg-destructive/90" : "bg-muted text-muted-foreground shadow-none",
                        )}
                      >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        Run Bulk Deletion
                      </button>
                      <button onClick={downloadTemplate} className="w-full py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted flex items-center justify-center gap-2">
                        <Download size={16} /> Download Delete Template
                      </button>
                    </div>
                  )}
                </div>
              )}

              {message.text && (
                <div
                  className={cn(
                    "mt-4 p-3 rounded-lg text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2",
                    message.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border border-destructive/20",
                  )}
                >
                  {message.type === "success" ? <Check size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                  <span className="break-words">{message.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{roleConfigs[activeRole].label} List</h2>
            <div className="flex flex-col xs:flex-row items-stretch gap-2 w-full sm:w-auto">
              <button
                onClick={downloadAllCredentials}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-all whitespace-nowrap"
              >
                <Printer size={14} /> Download Credentials
              </button>
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <DataTable
              columns={columns[activeRole]}
              data={users[activeRole].filter(u =>
                u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.customId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.id?.toLowerCase().includes(searchTerm.toLowerCase())
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


