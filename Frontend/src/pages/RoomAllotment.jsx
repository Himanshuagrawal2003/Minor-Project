import React, { useState, useRef } from 'react';
import { BedDouble, Users, UserPlus, Search, Filter, FileSpreadsheet, Upload, Download, Check, AlertCircle, Loader2 } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { mockStudents, mockRooms, initialAllotments } from '../data/mockData';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';

export function RoomAllotment() {
  const [allotments, setAllotments] = useState(initialAllotments.map(a => {
    const student = mockStudents.find(s => s.id === a.studentId);
    const room = mockRooms.find(r => r.id === a.roomId);
    return { ...a, student, room, status: 'Active' };
  }));
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'bulk'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
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
      date: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    setAllotments([newAllotment, ...allotments]);
    setSelectedStudent('');
    setSelectedRoom('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

        // Process bulk data
        const newBulkAllotments = [];
        let errorCount = 0;

        jsonData.forEach((row, index) => {
          const studentId = row.StudentID || row['Student ID'];
          const roomNumber = row.RoomNumber || row['Room Number'];

          const student = mockStudents.find(s => s.id === studentId);
          const room = mockRooms.find(r => r.number === roomNumber);

          if (student && room) {
            // Check if already allotted
            const isAlreadyAllotted = allotments.some(a => a.student?.id === student.id) || 
                                     newBulkAllotments.some(a => a.student?.id === student.id);
            
            // Check room capacity
            const currentOccupancy = allotments.filter(a => a.room?.id === room.id).length + 
                                   newBulkAllotments.filter(a => a.room?.id === room.id).length;
            
            if (!isAlreadyAllotted && currentOccupancy < room.capacity) {
              newBulkAllotments.push({
                id: `AL-B${Date.now()}-${index}`,
                student,
                room,
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
          setAllotments([...newBulkAllotments, ...allotments]);
          setUploadSuccess(`Successfully allotted ${newBulkAllotments.length} students. ${errorCount > 0 ? `${errorCount} entries failed validation.` : ''}`);
        } else {
          setUploadError('No valid allotments found in the file. Please check IDs and room capacities.');
        }
      } catch (err) {
        setUploadError('Failed to parse file. Please ensure it follows the correct format.');
        console.error(err);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'Student ID': 'S102', 'Room Number': 'A-102' },
      { 'Student ID': 'S103', 'Room Number': 'B-201' },
      { 'Student ID': 'S105', 'Room Number': 'G-102' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "bulk_allotment_template.xlsx");
  };

  const filteredRoomsForSelection = mockRooms.filter((room) => {
    const occupancy = allotments.filter(a => a.room?.id === room.id).length;
    return occupancy < room.capacity;
  }).filter(room => capacityFilter === 'all' || room.capacity.toString() === capacityFilter);

  const availableStudents = mockStudents.filter(
    (student) => !allotments.some((a) => a.student?.id === student.id)
  );

  const tableColumns = [
    { header: 'Allotment ID', accessorKey: 'id' },
    { 
      header: 'Student Name', 
      accessorKey: 'student', 
      cell: (row) => (
        <div className="font-medium text-foreground">{row.student?.name || 'Unknown'}</div>
      )
    },
    { 
      header: 'Room No.', 
      accessorKey: 'room', 
      cell: (row) => row.room?.number || 'N/A' 
    },
    { 
      header: 'Capacity', 
      accessorKey: 'room', 
      cell: (row) => (
        <span className="text-muted-foreground">{row.room?.capacity || 0} Seater</span>
      )
    },
    { 
      header: 'Date', 
      accessorKey: 'date' 
    },
    { 
      header: 'Status', 
      accessorKey: 'status', 
      cell: (row) => <StatusBadge status={row.status || 'Confirmed'} /> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Room Allotment</h1>
          <p className="text-muted-foreground mt-1">Assign students to available hostel rooms manually or in bulk.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allotment Form Section */}
        <div className="lg:col-span-1">
          <div className="glass-card overflow-hidden">
            {/* Tabs Toggle */}
            <div className="flex border-b border-border/50">
              <button 
                onClick={() => setActiveTab('manual')}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2",
                  activeTab === 'manual' ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <UserPlus size={16} /> Manual
              </button>
              <button 
                onClick={() => setActiveTab('bulk')}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2",
                  activeTab === 'bulk' ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <FileSpreadsheet size={16} /> Bulk Upload
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'manual' ? (
                <form onSubmit={handleManualAllot} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Student</label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      required
                    >
                      <option value="">Choosing a student...</option>
                      {availableStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.course})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Select Room</label>
                      <div className="flex items-center gap-2">
                        <Filter size={14} className="text-muted-foreground" />
                        <select 
                          className="text-[11px] bg-transparent border-none focus:ring-0 text-muted-foreground font-medium"
                          value={capacityFilter}
                          onChange={(e) => setCapacityFilter(e.target.value)}
                        >
                          <option value="all">All Capacities</option>
                          <option value="3">3 Seater</option>
                          <option value="4">4 Seater</option>
                        </select>
                      </div>
                    </div>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      required
                    >
                      <option value="">Choose a room...</option>
                      {filteredRoomsForSelection.map(r => {
                        const occ = allotments.filter(a => a.room?.id === r.id).length;
                        return (
                          <option key={r.id} value={r.id}>{r.number} - {r.capacity} Seater ({occ}/{r.capacity})</option>
                        );
                      })}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm mt-4 flex items-center justify-center gap-2"
                  >
                    <BedDouble size={18} /> Allot Room
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "group relative border-2 border-dashed border-border/60 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5",
                      isUploading && "pointer-events-none opacity-50"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                    />
                    
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                      {isUploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                    </div>
                    
                    <div className="text-center">
                      <p className="font-semibold">{isUploading ? 'Processing File...' : 'Click to Upload Excel'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Supports .xlsx, .xls, .csv</p>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start gap-3 animate-in fade-in zoom-in-95">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <p>{uploadError}</p>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-sm rounded-lg flex items-start gap-3 animate-in fade-in zoom-in-95">
                      <Check size={16} className="shrink-0 mt-0.5" />
                      <p>{uploadSuccess}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border/50">
                    <button 
                      onClick={downloadTemplate}
                      className="w-full py-2.5 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={18} /> Download Sample Template
                    </button>
                    <p className="text-[11px] text-muted-foreground text-center mt-3">
                      Use the template format to ensure IDs and room numbers match the system data.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Allotments Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Allotments</h2>
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-input bg-background/50 focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <DataTable columns={tableColumns} data={allotments} />
        </div>
      </div>
    </div>
  );
}
