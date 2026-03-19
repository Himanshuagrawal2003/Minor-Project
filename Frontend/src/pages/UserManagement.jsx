import React, { useState, useRef } from 'react';
import { Users, UserPlus, Search, FileSpreadsheet, Upload, Download, Check, AlertCircle, Loader2, UserCheck, ShieldCheck, Mail, BookOpen, Building, Copy, ExternalLink, Printer } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { FormInput } from '../components/FormInput';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';

export function UserManagement() {
  const [activeRole, setActiveRole] = useState('student'); // 'student', 'warden', 'chief-warden'
  const [activeMethod, setActiveMethod] = useState('manual'); // 'manual', 'bulk'
  
  // Mock Users State
  const [users, setUsers] = useState({
    student: [
      { id: 'S101', name: 'Rahul Sharma', email: 'rahul@example.com', course: 'B.Tech CSE', year: '2nd' },
      { id: 'S102', name: 'Priya Patel', email: 'priya@example.com', course: 'B.Arch', year: '1st' },
    ],
    warden: [
      { id: 'W201', name: 'Amit Kumar', email: 'amit@hostel.com', block: 'Block A', experience: '5 Years' },
    ],
    'chief-warden': [
      { id: 'CW301', name: 'Dr. S.K. Verma', email: 'verma@hostel.com', department: 'Administration' },
    ]
  });

  const [formData, setFormData] = useState({ name: '', email: '', extra: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const handleManualAdd = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const prefix = activeRole === 'student' ? 'S' : activeRole === 'warden' ? 'W' : 'CW';
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedId = `${prefix}${randomNum}`;

      const newUser = {
        id: generatedId,
        name: formData.name,
        email: formData.email,
        [activeRole === 'student' ? 'course' : activeRole === 'warden' ? 'block' : 'department']: formData.extra
      };

      setUsers({
        ...users,
        [activeRole]: [newUser, ...users[activeRole]]
      });

      setFormData({ name: '', email: '', extra: '' });
      setMessage({ type: 'success', text: `Successfully generated Account for ${formData.name}. ID/Password: ${generatedId}` });
      setIsLoading(false);
    }, 600);
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newUsers = jsonData.map((row, idx) => ({
          id: row.ID || row.Id || `TEMP-${idx}`,
          name: row.Name || 'Unknown',
          email: row.Email || 'N/A',
          [activeRole === 'student' ? 'course' : activeRole === 'warden' ? 'block' : 'department']: row.Extra || row.Course || row.Block || row.Department || 'N/A'
        }));

        setUsers({
          ...users,
          [activeRole]: [...newUsers, ...users[activeRole]]
        });

        setMessage({ type: 'success', text: `Bulk uploaded ${newUsers.length} ${activeRole}s successfully!` });
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to process file. Please check the format.' });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      { ID: '1001', Name: 'John Doe', Email: 'john@example.com', Extra: activeRole === 'student' ? 'CSE' : activeRole === 'warden' ? 'Block B' : 'Admin' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${activeRole}_upload_template.xlsx`);
  };

  const downloadAllCredentials = () => {
    const data = users[activeRole].map(u => ({
      'Full Name': u.name,
      'User ID / Username': u.id,
      'Temporary Password': u.id,
      'Role': activeRole.toUpperCase()
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Credentials");
    XLSX.writeFile(wb, `${activeRole}_credentials_list.xlsx`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Simple toast-like feedback could be added here, but for now just a console log or visual cue
  };

  const columns = {
    student: [
      { header: 'Student ID', accessorKey: 'id' },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Course', accessorKey: 'course' },
      { 
        header: 'Temp Password', 
        accessorKey: 'id', 
        cell: (row) => (
          <div className="flex items-center gap-2 group/cell">
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{row.id}</code>
            <button 
              onClick={() => copyToClipboard(row.id)}
              className="p-1 opacity-0 group-hover/cell:opacity-100 hover:bg-muted rounded transition-all"
              title="Copy ID"
            >
              <Copy size={12} className="text-muted-foreground" />
            </button>
          </div>
        ) 
      },
    ],
    warden: [
      { header: 'Warden ID', accessorKey: 'id' },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Block', accessorKey: 'block' },
      { 
        header: 'Temp Password', 
        accessorKey: 'id', 
        cell: (row) => (
          <div className="flex items-center gap-2 group/cell">
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{row.id}</code>
            <button 
              onClick={() => copyToClipboard(row.id)}
              className="p-1 opacity-0 group-hover/cell:opacity-100 hover:bg-muted rounded transition-all"
            >
              <Copy size={12} className="text-muted-foreground" />
            </button>
          </div>
        ) 
      },
    ],
    'chief-warden': [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Department', accessorKey: 'department' },
      { 
        header: 'Temp Password', 
        accessorKey: 'id', 
        cell: (row) => (
          <div className="flex items-center gap-2 group/cell">
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{row.id}</code>
            <button 
              onClick={() => copyToClipboard(row.id)}
              className="p-1 opacity-0 group-hover/cell:opacity-100 hover:bg-muted rounded transition-all"
            >
              <Copy size={12} className="text-muted-foreground" />
            </button>
          </div>
        ) 
      },
    ]
  };

  const roleConfigs = {
    student: { icon: Users, label: 'Students', color: 'text-blue-500', extraLabel: 'Course / Year' },
    warden: { icon: UserCheck, label: 'Wardens', color: 'text-emerald-500', extraLabel: 'Assigned Block' },
    'chief-warden': { icon: ShieldCheck, label: 'Chief Warden', color: 'text-purple-500', extraLabel: 'Department' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Add and manage system users across all roles.</p>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit border border-border/50">
        {Object.entries(roleConfigs).map(([key, config]) => (
          <button
            key={key}
            onClick={() => { setActiveRole(key); setMessage({type:'', text:''}); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeRole === key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <config.icon size={16} className={activeRole === key ? config.color : ""} />
            {config.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="glass-card overflow-hidden">
            <div className="flex border-b border-border/50">
              <button 
                onClick={() => setActiveMethod('manual')}
                className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all", activeMethod === 'manual' ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground")}
              >
                Manual Add
              </button>
              <button 
                onClick={() => setActiveMethod('bulk')}
                className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all", activeMethod === 'bulk' ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground")}
              >
                Bulk Import
              </button>
            </div>

            <div className="p-6">
              {activeMethod === 'manual' ? (
                <form onSubmit={handleManualAdd} className="space-y-4">
                  <FormInput 
                    label="Full Name" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    required
                  />
                  <FormInput 
                    label="Email Address" 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="name@example.com"
                    required
                  />
                  <FormInput 
                    label={roleConfigs[activeRole].extraLabel} 
                    value={formData.extra}
                    onChange={e => setFormData({...formData, extra: e.target.value})}
                    placeholder={`e.g. ${activeRole === 'student' ? 'B.Tech IT' : activeRole === 'warden' ? 'Block B' : 'Accounts'}`}
                    required
                  />
                  <button className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />} Generate ID & Add
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-border p-8 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/30 transition-all group"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleBulkUpload} className="hidden" accept=".xlsx,.xls,.csv" />
                    <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                      {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                    </div>
                    <p className="text-sm font-semibold">Upload Excel Dataset</p>
                    <p className="text-xs text-muted-foreground text-center">Batch create {activeRole} IDs and profiles automatically.</p>
                  </div>
                  <button onClick={downloadTemplate} className="w-full py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted flex items-center justify-center gap-2">
                    <Download size={16} /> Download CSV Template
                  </button>
                </div>
              )}

              {message.text && (
                <div className={cn(
                  "mt-4 p-3 rounded-lg text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2",
                  message.type === 'success' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                )}>
                  {message.type === 'success' ? <Check size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{roleConfigs[activeRole].label} List</h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={downloadAllCredentials}
                className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-semibold hover:bg-muted transition-all"
              >
                <Printer size={14} /> Download Credentials List
              </button>
              <div className="relative w-48">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
          </div>
          <DataTable columns={columns[activeRole]} data={users[activeRole]} />
        </div>
      </div>
    </div>
  );
}
