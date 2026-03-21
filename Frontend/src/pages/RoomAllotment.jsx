import React, { useState, useRef } from 'react';
import { BedDouble, Users, UserPlus, Search, Filter, FileSpreadsheet, Upload, Download, Check, AlertCircle, Loader2, List, Trash2, Calendar, Hash, Plus, Edit2, X } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { mockStudents, mockRooms, initialAllotments } from '../data/mockData';
import { getAllotments, saveAllotments, addAllotment, removeAllotment, updateAllotment } from '../services/roomStore';
import { getAvailableMesses } from '../services/messStore';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';

export function RoomAllotment() {
  const role = localStorage.getItem('role');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'manage', 'checkout'
  const [searchTerm, setSearchTerm] = useState('');
  const [checkoutSearchTerm, setCheckoutSearchTerm] = useState('');
  
  const [allotments, setAllotments] = useState(getAllotments);
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [availableMesses, setAvailableMesses] = useState(getAvailableMesses());
  const [selectedMess, setSelectedMess] = useState(availableMesses[0]);
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'bulk'
  const [checkoutTab, setCheckoutTab] = useState('manual'); // 'manual' or 'bulk'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingAllotment, setEditingAllotment] = useState(null);
  const fileInputRef = useRef(null);


  const handleManualAllot = (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRoom) return;

    const student = mockStudents.find(s => s.id === selectedStudent);
    const room = mockRooms.find(r => r.id === selectedRoom);

    const newAllotment = {
      id: `AL00${allotments.length + 1}`,
      student,
      room,
      messId: selectedMess,
      date: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    const updated = addAllotment(newAllotment);
    setAllotments(updated);
    
    setSelectedStudent('');
    setSelectedRoom('');
    setUploadSuccess('Room and Mess allotted successfully!');
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const processBulkAllotment = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newBulkAllotments = [];
        let errorCount = 0;

        jsonData.forEach((row, index) => {
          const studentId = row.StudentID || row['Student ID'];
          const roomNumber = row.RoomNumber || row['Room Number'];

          const student = mockStudents.find(s => s.id === studentId);
          const room = mockRooms.find(r => r.number === roomNumber);

          if (student && room) {
            const isAlreadyAllotted = allotments.some(a => a.student?.id === student.id) || 
                                     newBulkAllotments.some(a => a.student?.id === student.id);
            
            const currentOccupancy = allotments.filter(a => a.room?.id === room.id).length + 
                                   newBulkAllotments.filter(a => a.room?.id === room.id).length;
            
              if (!isAlreadyAllotted && currentOccupancy < room.capacity) {
                newBulkAllotments.push({
                  id: `AL-B${Date.now()}-${index}`,
                  student,
                  room,
                  messId: row.MessID || row['Mess ID'] || availableMesses[0],
                  date: new Date().toISOString().split('T')[0],
                  status: 'Active'
                });
              } else {
                errorCount++;
              }
            } else {
              errorCount++;
            }
          });

          if (newBulkAllotments.length > 0) {
            const current = getAllotments();
            const combined = [...newBulkAllotments, ...current];
            saveAllotments(combined);
            setAllotments(combined);
            setUploadSuccess(`Successfully allotted ${newBulkAllotments.length} students. ${errorCount > 0 ? `${errorCount} entries failed validation.` : ''}`);
            setSelectedFile(null);
        } else {
          setUploadError('No valid allotments found in the file. Please check IDs and room capacities.');
        }
      } catch (err) {
        setUploadError('Failed to parse file. Please ensure it follows the correct format.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setUploadSuccess(null), 5000);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const processBulkCheckout = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let failedCount = 0;

        const updatedAllotments = [...allotments];
        
        jsonData.forEach((row) => {
          const studentId = row.StudentID || row['Student ID'];
          const index = updatedAllotments.findIndex(a => a.student?.id === studentId);
          
          if (index !== -1) {
            updatedAllotments.splice(index, 1);
            successCount++;
          } else {
            failedCount++;
          }
        });

        if (successCount > 0) {
          saveAllotments(updatedAllotments);
          setAllotments(updatedAllotments);
          setUploadSuccess(`Successfully checked out ${successCount} students. ${failedCount > 0 ? `${failedCount} IDs not found in registry.` : ''}`);
          setSelectedFile(null);
        } else {
          setUploadError('No matching Student IDs found in the registry. Please check your Excel file.');
        }
      } catch (err) {
        setUploadError('Failed to parse file. Please ensure it follows the correct format.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setUploadSuccess(null), 5000);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDeleteAllotment = (id) => {
    if (window.confirm('Are you sure you want to check out this student? This will free up the bed.')) {
      const updated = removeAllotment(id);
      setAllotments(updated);
      setUploadSuccess('Student checked out successfully!');
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const handleUpdateMess = (id, newMessId) => {
    const updated = updateAllotment(id, { messId: newMessId });
    setAllotments(updated);
    setEditingAllotment(null);
    setUploadSuccess('Mess re-allotted successfully!');
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const downloadAllotments = () => {

    const data = allotments.map(a => ({
      'Allotment ID': a.id,
      'Student ID': a.student?.id,
      'Student Name': a.student?.name,
      'Room Number': a.room?.number,
      'Date': a.date,
      'Status': a.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Allotments");
    XLSX.writeFile(wb, "hostel_allotments_list.xlsx");
  };

  const downloadTemplate = () => {
    let templateData = [];
    let filename = "";
    
    if (viewMode === 'manage') {
      templateData = [
        { 'StudentID': 'S102', 'RoomNumber': 'A-102' },
        { 'StudentID': 'S103', 'RoomNumber': 'B-201' }
      ];
      filename = "bulk_allotment_template.xlsx";
    } else {
      templateData = [
        { 'StudentID': 'S101' },
        { 'StudentID': 'S104' }
      ];
      filename = "bulk_checkout_template.xlsx";
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, filename);
  };

  const filteredAllotments = allotments.filter(a => 
    a.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.student?.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.room?.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableColumns = [
    { header: 'ID', accessorKey: 'id' },
    { 
      header: 'Student', 
      accessorKey: 'student', 
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground truncate max-w-[150px]">{row.student?.name}</span>
          <span className="text-[10px] text-muted-foreground uppercase">{row.student?.id}</span>
        </div>
      )
    },
    { header: 'Room', accessorKey: 'room', cell: (row) => <span className="font-mono font-bold text-primary">{row.room?.number}</span> },
    { header: 'Mess', accessorKey: 'messId', cell: (row) => <span className="font-bold text-muted-foreground">{row.messId || 'N/A'}</span> },
    { header: 'Type', accessorKey: 'room', cell: (row) => <span className="text-xs text-muted-foreground">{row.room?.capacity} Seater</span> },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Status', accessorKey: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Action', 
      accessorKey: 'id',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setEditingAllotment(row)}
            className="p-2 text-amber-600 hover:bg-amber-600/10 rounded-lg transition-all"
            title="Edit Mess"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => handleDeleteAllotment(row.id)}
            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
            title="Check Out Student"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    },
  ];


  const availableStudents = mockStudents.filter(
    (student) => !allotments.some((a) => a.student?.id === student.id)
  );

  const filteredRoomsForSelection = mockRooms.filter((room) => {
    const occupancy = allotments.filter(a => a.room?.id === room.id).length;
    return occupancy < room.capacity;
  }).filter(room => capacityFilter === 'all' || room.capacity.toString() === capacityFilter);

  return (
    <div className="space-y-6 pt-5 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Assign and monitor hostel room distribution.</p>
        </div>
        
        <div className="flex gap-1 p-1 bg-muted/40 backdrop-blur-md rounded-2xl border border-border/50 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setViewMode('list')}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              viewMode === 'list' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List size={16} /> <span className="hidden sm:inline">Allotted</span> List
          </button>
          <button 
            onClick={() => setViewMode('manage')}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              viewMode === 'manage' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserPlus size={16} /> <span className="hidden sm:inline">New</span> Allotment
          </button>
          <button 
            onClick={() => setViewMode('checkout')}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              viewMode === 'checkout' ? "bg-background shadow-lg text-destructive" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Trash2 size={16} /> <span className="hidden sm:inline">Student</span> CheckOut
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, ID, or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
             </div>
             <button 
               onClick={downloadAllotments}
               className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all active:scale-95 duration-200"
             >
               <Download size={18} /> Export <span className="hidden sm:inline">to Excel</span>
             </button>
          </div>

          {/* Table for Desktop, Cards for Mobile */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border/50 shadow-sm">
            <DataTable columns={tableColumns} data={filteredAllotments} />
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredAllotments.length > 0 ? (
              filteredAllotments.map((a) => (
                <div key={a.id} className="glass-card p-5 border border-border/50 space-y-4 hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{a.student?.name}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">{a.student?.id}</p>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Hash size={10} /> Room & Type</p>
                      <p className="text-sm font-bold text-primary">{a.room?.number} <span className="text-[10px] text-muted-foreground font-medium italic">({a.room?.capacity} Seater)</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Calendar size={10} /> Allotted On</p>
                      <p className="text-sm font-medium text-foreground">{a.date}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDeleteAllotment(a.id)}
                    className="w-full py-2.5 bg-destructive/5 text-destructive border border-destructive/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 size={14} /> Check Out Student
                  </button>
                </div>
              ))
            ) : (
              <div className="p-12 text-center rounded-2xl border-2 border-dashed border-border/40">
                <Search size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No allotments found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'manage' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-1">
            <div className="glass-card overflow-hidden border border-border/50">
              <div className="flex border-b border-border/50 bg-muted/10">
                <button onClick={() => setActiveTab('manual')} className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all", activeTab === 'manual' ? "bg-background text-primary border-b-2 border-primary shadow-inner" : "text-muted-foreground hover:bg-muted/30")}>Manual Form</button>
                <button onClick={() => setActiveTab('bulk')} className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all", activeTab === 'bulk' ? "bg-background text-primary border-b-2 border-primary shadow-inner" : "text-muted-foreground hover:bg-muted/30")}>Bulk Upload</button>
              </div>

              <div className="p-6">
                {activeTab === 'manual' ? (
                  <form onSubmit={handleManualAllot} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Select Student</label>
                      <select className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required>
                        <option value="">Choosing a student...</option>
                        {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.course})</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Select Room</label>
                          <select className="text-[10px] font-bold text-primary bg-transparent outline-none cursor-pointer" value={capacityFilter} onChange={(e) => setCapacityFilter(e.target.value)}>
                            <option value="all">All Capacities</option>
                            <option value="3">3 Seater</option>
                            <option value="4">4 Seater</option>
                          </select>
                       </div>
                       <select className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} required>
                        <option value="">Choose a room...</option>
                        {filteredRoomsForSelection.map(r => <option key={r.id} value={r.id}>{r.number} - {r.capacity} Seater</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Assign Mess</label>
                      <select className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium" value={selectedMess} onChange={(e) => setSelectedMess(e.target.value)} required>
                        {availableMesses.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    
                    <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 mt-2 active:scale-95">
                      <BedDouble size={20} /> Confirm Allotment
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                     <div 
                       onClick={() => fileInputRef.current?.click()} 
                       className={cn(
                         "group border-2 border-dashed border-border/60 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all duration-300",
                         selectedFile && "border-primary/40 bg-primary/5"
                       )}
                     >
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx,.xls,.csv" className="hidden" />
                        <div className={cn(
                          "h-16 w-16 rounded-full flex items-center justify-center transition-transform",
                          selectedFile ? "bg-emerald-500/10 text-emerald-600 outline outline-4 outline-emerald-500/5 scale-110" : "bg-primary/10 text-primary group-hover:scale-110"
                        )}>
                          {selectedFile ? <Check size={28} /> : <Upload size={28} />}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold">{selectedFile ? selectedFile.name : 'Upload Allotment Excel'}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">
                            {selectedFile ? 'File selected! Ready to process.' : 'Click to browse your files'}
                          </p>
                        </div>
                     </div>

                     <button 
                       onClick={processBulkAllotment}
                       disabled={isUploading || !selectedFile}
                       className={cn(
                         "w-full py-4 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3",
                         selectedFile ? "bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700" : "bg-muted text-muted-foreground shadow-none"
                       )}
                     >
                       {isUploading ? <Loader2 size={20} className="animate-spin" /> : <FileSpreadsheet size={20} />}
                       Process Bulk Allotment
                     </button>

                     <button onClick={downloadTemplate} className="w-full py-3 text-xs font-bold border border-border rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-2 group">
                        <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Download Allotment Template
                     </button>
                  </div>
                )}
                
                {(uploadSuccess || uploadError) && (
                  <div className={cn("mt-6 p-4 rounded-xl text-xs font-bold flex gap-3 animate-in slide-in-from-top-2", uploadSuccess ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shadow-emerald-500/10" : "bg-destructive/10 text-destructive border border-destructive/20 shadow-sm shadow-destructive/10")}>
                    {uploadSuccess ? <Check size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                    <p className="leading-relaxed">{uploadSuccess || uploadError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vacant Rooms Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 underline underline-offset-8 decoration-primary/20">
                <Users size={16} className="text-primary" /> Live Vacancy Dashboard
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockRooms.filter(r => allotments.filter(a => a.room?.id === r.id).length < r.capacity).slice(0, 8).map(r => (
                <div key={r.id} className="p-6 glass-card border-none bg-emerald-500/5 group hover:bg-emerald-500/10 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1.5 bg-emerald-500/20 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={12} className="text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-black text-emerald-600 tracking-tighter">{r.number}</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">{r.capacity} Seater</span>
                      <span className="text-[11px] font-extrabold text-emerald-700/70">{r.capacity - allotments.filter(a => a.room?.id === r.id).length} Beds Available</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4 animate-in slide-in-from-right-4 duration-500">
               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><AlertCircle size={20} /></div>
               <p className="text-xs font-medium text-foreground/70 leading-relaxed">
                 <strong className="text-primary font-bold">Pro Tip:</strong> Use the "Bulk Upload" feature for semester-wide room transitions. Ensure your Excel sheet matches the student IDs exactly to avoid allotment failures.
               </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-1">
            <div className="glass-card overflow-hidden border border-border/50">
              <div className="flex border-b border-border/50 bg-muted/10">
                <button onClick={() => setCheckoutTab('manual')} className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all", checkoutTab === 'manual' ? "bg-background text-destructive border-b-2 border-destructive shadow-inner" : "text-muted-foreground hover:bg-muted/30")}>Manual Checkout</button>
                <button onClick={() => setCheckoutTab('bulk')} className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all", checkoutTab === 'bulk' ? "bg-background text-destructive border-b-2 border-destructive shadow-inner" : "text-muted-foreground hover:bg-muted/30")}>Bulk Checkout</button>
              </div>

              <div className="p-6">
                {checkoutTab === 'manual' ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Quick Checkout Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="Search student name/ID..." 
                          value={checkoutSearchTerm}
                          onChange={(e) => setCheckoutSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-destructive/20 outline-none transition-all text-sm" 
                        />
                      </div>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {allotments.filter(a => 
                        a.student?.name.toLowerCase().includes(checkoutSearchTerm.toLowerCase()) ||
                        a.student?.id.toLowerCase().includes(checkoutSearchTerm.toLowerCase())
                      ).length > 0 ? (
                        allotments.filter(a => 
                          a.student?.name.toLowerCase().includes(checkoutSearchTerm.toLowerCase()) ||
                          a.student?.id.toLowerCase().includes(checkoutSearchTerm.toLowerCase())
                        ).map(a => (
                          <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-all">
                            <div>
                              <p className="text-xs font-bold">{a.student?.name}</p>
                              <p className="text-[10px] text-muted-foreground">Room {a.room?.number}</p>
                            </div>
                            <button 
                              onClick={() => handleDeleteAllotment(a.id)}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-8 text-[10px] text-muted-foreground">No active allotments found.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <div 
                       onClick={() => fileInputRef.current?.click()} 
                       className={cn(
                         "group border-2 border-dashed border-border/60 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-destructive/5 hover:border-destructive/50 transition-all duration-300",
                         selectedFile && "border-destructive/40 bg-destructive/5"
                       )}
                     >
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx,.xls,.csv" className="hidden" />
                        <div className={cn(
                          "h-16 w-16 rounded-full flex items-center justify-center transition-transform",
                          selectedFile ? "bg-destructive/10 text-destructive outline-destructive/5 outline outline-4 scale-110" : "bg-destructive/10 text-destructive group-hover:scale-110"
                        )}>
                          {selectedFile ? <Check size={28} /> : <Trash2 size={28} />}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold">{selectedFile ? selectedFile.name : 'Bulk Checkout Excel'}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">
                            {selectedFile ? 'File selected! Ready to process.' : 'Click to browse your files'}
                          </p>
                        </div>
                     </div>

                     <button 
                       onClick={processBulkCheckout}
                       disabled={isUploading || !selectedFile}
                       className={cn(
                         "w-full py-4 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3",
                         selectedFile ? "bg-destructive text-white shadow-destructive-500/20 hover:bg-destructive/90" : "bg-muted text-muted-foreground shadow-none"
                       )}
                     >
                       {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                       Run Bulk Checkout
                     </button>

                     <button onClick={downloadTemplate} className="w-full py-3 text-xs font-bold border border-border rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-2 group">
                        <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Download Checkout Template
                     </button>
                  </div>
                )}
                
                {(uploadSuccess || uploadError) && (
                  <div className={cn("mt-6 p-4 rounded-xl text-xs font-bold flex gap-3 animate-in slide-in-from-top-2", uploadSuccess ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shadow-emerald-500/10" : "bg-destructive/10 text-destructive border border-destructive/20 shadow-sm shadow-destructive/10")}>
                    {uploadSuccess ? <Check size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                    <p className="leading-relaxed">{uploadSuccess || uploadError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4 border-none bg-destructive/5">
               <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive"><Trash2 size={32} /></div>
               <div>
                  <h3 className="text-lg font-bold">Standard Student Checkout</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">Use this section to process student departures. Manual checkout removes a single student, while Bulk Checkout handles many at once.</p>
               </div>
               <div className="p-4 bg-background rounded-xl border border-destructive/10 text-[10px] font-bold text-destructive uppercase tracking-wider">
                  Caution: This action will permanently free up the room seat.
               </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Allotment Modal */}
      {editingAllotment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-background border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Re-allot Mess</h2>
              <button onClick={() => setEditingAllotment(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <p className="font-bold">{editingAllotment.student?.name}</p>
                  <p className="text-xs text-muted-foreground">{editingAllotment.student?.id} • Room {editingAllotment.room?.number}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Select New Mess</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all font-medium" 
                  defaultValue={editingAllotment.messId}
                  onChange={(e) => handleUpdateMess(editingAllotment.id, e.target.value)}
                >
                  {availableMesses.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="pt-2">
                <p className="text-[10px] text-center text-muted-foreground italic">
                  Note: Updating the mess will take effect immediately for the student.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

