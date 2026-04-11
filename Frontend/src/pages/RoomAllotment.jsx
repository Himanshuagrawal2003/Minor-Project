import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BedDouble, Users, UserPlus, Search, Filter, FileSpreadsheet, Upload, Download, Check, AlertCircle, Loader2, List, Trash2, Calendar, Hash, Plus, Edit2, X } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';

export function RoomAllotment() {
  const [searchParams] = useSearchParams();
  const preSelectedId = searchParams.get('studentId');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'manage', 'checkout'
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'bulk'
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allotments, setAllotments] = useState([]);
  const [backendMesses, setBackendMesses] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('A');
  const [selectedMess, setSelectedMess] = useState('Mess 1');

  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingAllotment, setEditingAllotment] = useState(null);
  const [checkoutSearchTerm, setCheckoutSearchTerm] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [checkoutTab, setCheckoutTab] = useState('manual'); // 'manual' or 'bulk'

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({ number: '', block: 'A', capacity: 3, type: 'Boys' });

  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/users');
      const studentList = (res.users || []).filter(u => u.role === 'student');
      setStudents(studentList);

      const roomRes = await api.get('/rooms');
      const roomList = roomRes.rooms || [];
      setRooms(roomList);

      try {
        // Fetch formally registered messes
        const messRes = await api.get('/mess/list');
        const formalMesses = Array.isArray(messRes) ? messRes : [];

        // Fetch distinct messes from menus in case they only exist there
        const menuMessesRes = await api.get('/mess/all');
        const menuMesses = Array.isArray(menuMessesRes) ? menuMessesRes : [];

        // Combine them ensuring no duplicates via case-insensitive messId/name
        const combinedMap = new Map();

        formalMesses.forEach(m => {
          if (!m.messId && !m.name) return;
          const key = String(m.messId || m.name).toLowerCase().replace(/[-\s]+/g, '');
          combinedMap.set(key, m);
        });

        menuMesses.forEach(id => {
          if (!id) return;
          const key = String(id).toLowerCase().replace(/[-\s]+/g, '');
          const existsByName = Array.from(combinedMap.values()).some(
            m => String(m.name || '').toLowerCase().replace(/[-\s]+/g, '') === key
          );

          if (!combinedMap.has(key) && !existsByName) {
            combinedMap.set(key, { messId: String(id), name: String(id), isActive: true });
          }
        });
        
        const combinedList = Array.from(combinedMap.values());
        setBackendMesses(combinedList);
        
        // If there are messes but none selected, select the first one
        if (combinedList.length > 0 && !selectedMess) {
          const firstMess = combinedList[0];
          setSelectedMess(firstMess.messId || firstMess.name);
        }
      } catch (err) {
        console.error("Failed to fetch messes", err);
      }

      // Derive allotments from users who have a roomNumber
      const activeAllotments = studentList.filter(s => s.roomNumber).map(s => {
        const roomInfo = roomList.find(r => r.number === s.roomNumber);
        return {
          id: s._id,
          student: { id: s.customId, name: s.name, _id: s._id },
          room: {
            number: s.roomNumber,
            capacity: roomInfo?.capacity || 3,
            block: s.block || roomInfo?.block || 'A',
            type: roomInfo?.type || s.buildingType || 'Boys'
          },
          messId: s.messId || 'None',
          date: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : 'Recently',
          status: 'Active'
        };
      });
      setAllotments(activeAllotments);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueBlocks = useMemo(() => [...new Set(rooms.map(r => r.block))].sort(), [rooms]);

  const filteredBlocks = useMemo(() => {
    const relevantRooms = buildingFilter === 'all'
      ? rooms
      : rooms.filter(r => r.type === buildingFilter);
    return [...new Set(relevantRooms.map(r => r.block))].sort();
  }, [rooms, buildingFilter]);

  const availableMesses = useMemo(() => {
    const activeBackendMesses = backendMesses.filter(m => m.isActive !== false);
    const activeMap = new Map();

    activeBackendMesses.forEach((m) => {
      const key = String(m.messId || m.name).toLowerCase().replace(/[-\s]+/g, '');
      if (key) activeMap.set(key, m);
    });

    const studentMessIds = [...new Set(students.filter((s) => s.messId).map((s) => s.messId))];
    studentMessIds.forEach((id) => {
      if (!id) return;
      const key = String(id).toLowerCase().replace(/[-\s]+/g, '');
      const existsByName = Array.from(activeMap.values()).some(
        (m) => String(m.name || '').toLowerCase().replace(/[-\s]+/g, '') === key
      );

      if (!activeMap.has(key) && !existsByName) {
        activeMap.set(key, { messId: String(id), name: String(id), isActive: true });
      }
    });

    return Array.from(activeMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [backendMesses, students]);

  useEffect(() => {
    fetchData();
    if (preSelectedId) {
      setSelectedStudent(preSelectedId);
      setViewMode('manage');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedId]);

  const handleManualAllot = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedRoom) return;

    try {
      await api.patch(`/users/${selectedStudent}/allot`, {
        roomNumber: selectedRoom,
        block: selectedBlock,
        messId: selectedMess
      });

      setUploadSuccess('Room allotted successfully!');
      setSelectedStudent('');
      setSelectedRoom('');
      fetchData();
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err) {
      setUploadError(err.message || 'Failed to allot room.');
    }
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
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log("Bulk Allotment Data:", jsonData);
        let successCount = 0;
        let errorCount = 0;

        for (const row of jsonData) {
          const rawId = row.StudentID || row['Student ID'];
          const studentId = String(rawId || "").trim();
          const roomNumber = row.RoomNumber || row['Room Number'];
          const block = row.Block || 'A';
          const building = row.Building || row['Building Type'] || row['Section'];
          const messId = row.MessID || row['Mess ID'] || 'Mess 1';

          console.log(`Processing student: ${studentId}, Room: ${roomNumber}`);
          
          const normalize = (id) => String(id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const normalizedInput = normalize(studentId);

          let student = students.find(s => 
            normalize(s.customId) === normalizedInput || 
            normalize(s._id) === normalizedInput
          );

          // Fallback: If ID matching fails, try to match by Name (case-insensitive)
          if (!student) {
             const studentName = (row.StudentName || row['Student Name'] || row.Name || "").trim().toLowerCase();
             if (studentName) {
                student = students.find(s => 
                   s.name.trim().toLowerCase() === studentName ||
                   normalize(s.name) === normalize(studentName)
                );
                if (student) console.log(`Matched student by name: ${student.name}`);
             }
          }

          if (student && roomNumber) {
            try {
              console.log(`Allotting ${student.name} to ${roomNumber}`);
              await api.patch(`/users/${student._id}/allot`, {
                roomNumber,
                block,
                buildingType: building,
                messId
              });
              successCount++;
            } catch (err) {
              console.error(`Failed to allot ${studentId}:`, err);
              errorCount++;
            }
          } else {
            console.warn(`Student not found or RoomNumber missing for: ${studentId}`);
            errorCount++;
          }
        }

        if (successCount > 0) {
          setUploadSuccess(`Successfully allotted ${successCount} students. ${errorCount > 0 ? `${errorCount} entries failed.` : ''}`);
          fetchData();
        } else {
          setUploadError('No valid allotments processed. Please check IDs and room numbers.');
        }
      } catch {
        setUploadError('Failed to parse file.');
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
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
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let failedCount = 0;

        for (const row of jsonData) {
          const studentId = row.StudentID || row['Student ID'];
          const student = students.find(s => s.customId === studentId || s._id === studentId);

          if (student) {
            try {
              await api.patch(`/users/${student._id}/allot`, {
                roomNumber: "",
                block: "",
                messId: ""
              });
              successCount++;
            } catch (err) {
              failedCount++;
            }
          } else {
            failedCount++;
          }
        }

        if (successCount > 0) {
          setUploadSuccess(`Successfully checked out ${successCount} students. ${failedCount > 0 ? `${failedCount} failed.` : ''}`);
          fetchData();
        } else {
          setUploadError('No matching students found.');
        }
      } catch {
        setUploadError('Failed to parse file.');
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setUploadSuccess(null), 5000);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      await api.post('/rooms/create', roomFormData);
      setIsRoomModalOpen(false);
      setRoomFormData({ number: '', block: 'A', capacity: 3, type: 'Boys' });
      fetchData();
      setUploadSuccess("Room created successfully!");
    } catch (err) {
      setUploadError(err.message || "Failed to create room.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      await api.put(`/rooms/${editingRoom._id}`, roomFormData);
      setIsRoomModalOpen(false);
      setEditingRoom(null);
      fetchData();
      setUploadSuccess("Room updated successfully!");
    } catch (err) {
      setUploadError(err.message || "Failed to update room.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room? This cannot be undone.")) return;
    try {
      setIsUploading(true);
      await api.delete(`/rooms/${id}`);
      fetchData();
      setUploadSuccess("Room deleted successfully!");
    } catch (err) {
      setUploadError(err.message || "Failed to delete room.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadSuccess(null), 3000);
    }
  };

  const handleDeleteAllotment = async (id) => {
    if (window.confirm('Are you sure you want to check out this student? This will free up the bed.')) {
      try {
        await api.patch(`/users/${id}/allot`, {
          roomNumber: "",
          block: "",
          messId: ""
        });
        setUploadSuccess('Student checked out successfully!');
        fetchData();
        setTimeout(() => setUploadSuccess(null), 3000);
      } catch (err) {
        setUploadError(err.message || 'Failed to checkout student.');
      }
    }
  };

  const handleUpdateMess = async (id, newMessId) => {
    try {
      await api.patch(`/users/${id}/allot`, {
        messId: newMessId
      });
      setUploadSuccess('Mess re-allotted successfully!');
      setEditingAllotment(null);
      fetchData();
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err) {
      setUploadError(err.message || 'Failed to update mess.');
    }
  };

  const downloadAllotments = () => {
    const data = allotments.map(a => ({
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
        { 'StudentID': 'S102', 'RoomNumber': '102', 'Block': 'A', 'Building': 'Boys', 'MessID': 'Mess 1' },
      ];
      filename = "bulk_allotment_template.xlsx";
    } else {
      templateData = [
        { 'StudentID': 'S101' },
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

  const availableStudents = students.filter(
    (student) => !allotments.some((a) => a.student?._id === student._id)
  );

  const filteredRoomsForSelection = rooms.filter((room) => {
    // Basic occupancy check
    const occupancy = allotments.filter(
      a => a.room?.number === room.number &&
        a.room?.block === room.block &&
        a.room?.type === room.type
    ).length;
    return occupancy < room.capacity;
  })
    .filter(room => buildingFilter === 'all' || room.type === buildingFilter)
    .filter(room => !selectedBlock || room.block === selectedBlock)
    .filter(room => capacityFilter === 'all' || room.capacity.toString() === capacityFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Room Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Assign and monitor hostel room distribution.</p>
        </div>

        <div className="flex gap-1 p-1 bg-muted/40 backdrop-blur-md rounded-2xl border border-border/50 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button onClick={() => setViewMode('list')} className={cn("flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap", viewMode === 'list' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground")}><List size={16} /> <span className="hidden sm:inline">Allotted</span> List</button>
          <button onClick={() => setViewMode('manage')} className={cn("flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap", viewMode === 'manage' ? "bg-background shadow-lg text-primary" : "text-muted-foreground hover:text-foreground")}><UserPlus size={16} /> <span className="hidden sm:inline">New</span> Allotment</button>
          <button onClick={() => setViewMode('checkout')} className={cn("flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap", viewMode === 'checkout' ? "bg-background shadow-lg text-destructive" : "text-muted-foreground hover:text-foreground")}><Trash2 size={16} /> <span className="hidden sm:inline">Student</span> CheckOut</button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search name, ID, or room..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <button onClick={downloadAllotments} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all active:scale-95 duration-200"><Download size={18} /> Export <span className="hidden sm:inline">to Excel</span></button>
          </div>

          <DataTable columns={tableColumns} data={filteredAllotments} />
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
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search by ID or Name..."
                          value={studentSearchTerm}
                          onChange={(e) => setStudentSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        />
                      </div>
                      <select
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        required
                      >
                        <option value="">Choosing a student...</option>
                        {availableStudents
                          .filter(s =>
                            s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                            s.customId.toLowerCase().includes(studentSearchTerm.toLowerCase())
                          )
                          .map(s => <option key={s._id} value={s._id}>{s.name} ({s.customId})</option>)
                        }
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Building</label>
                        <select
                          className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium"
                          value={buildingFilter}
                          onChange={(e) => {
                            setBuildingFilter(e.target.value);
                            setSelectedBlock("");
                            setSelectedRoom("");
                          }}
                        >
                          <option value="all">All Buildings</option>
                          <option value="Boys">Boys Hostel</option>
                          <option value="Girls">Girls Hostel</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Block</label>
                        <select
                          className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium"
                          value={selectedBlock}
                          onChange={(e) => {
                            setSelectedBlock(e.target.value);
                            setSelectedRoom("");
                          }}
                        >
                          <option value="">Select Block...</option>
                          {filteredBlocks.map(b => <option key={b} value={b}>{b} Block</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Select Room</label>
                      <select
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium"
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        required
                        disabled={!selectedBlock}
                      >
                        <option value="">{!selectedBlock ? "Select block first..." : "Choose a room..."}</option>
                        {filteredRoomsForSelection.map(r => (
                          <option key={`${r.block}-${r.number}`} value={r.number}>
                            Room {r.number} ({r.capacity} Seater)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Assign Mess</label>
                      <select className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium" value={selectedMess} onChange={(e) => setSelectedMess(e.target.value)} required>
                        {availableMesses.map(m => {
                          const id = m.messId || m.name;
                          return <option key={id} value={id}>{m.name} ({id})</option>
                        })}
                      </select>
                    </div>

                    <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 mt-2 active:scale-95"><BedDouble size={20} /> Confirm Allotment</button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div onClick={() => fileInputRef.current?.click()} className={cn("group border-2 border-dashed border-border/60 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all duration-300", selectedFile && "border-primary/40 bg-primary/5")}>
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx,.xls,.csv" className="hidden" />
                      <div className={cn("h-16 w-16 rounded-full flex items-center justify-center transition-transform", selectedFile ? "bg-emerald-500/10 text-emerald-600 outline outline-4 outline-emerald-500/5 scale-110" : "bg-primary/10 text-primary group-hover:scale-110")}>{selectedFile ? <Check size={28} /> : <Upload size={28} />}</div>
                      <div className="text-center"><p className="text-sm font-bold">{selectedFile ? selectedFile.name : 'Upload Allotment Excel'}</p><p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">{selectedFile ? 'File selected!' : 'Click to browse'}</p></div>
                    </div>
                    <button onClick={processBulkAllotment} disabled={isUploading || !selectedFile} className={cn("w-full py-4 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3", selectedFile ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-muted text-muted-foreground")}>{isUploading ? <Loader2 size={20} className="animate-spin" /> : <FileSpreadsheet size={20} />} Process Bulk Allotment</button>
                    <button onClick={downloadTemplate} className="w-full py-3 text-xs font-bold border border-border rounded-xl hover:bg-muted transition-all flex items-center justify-center gap-2 group"><Download size={16} /> Template</button>
                  </div>
                )}

                {(uploadSuccess || uploadError) && (<div className={cn("mt-6 p-4 rounded-xl text-xs font-bold flex gap-3 animate-in slide-in-from-top-2", uploadSuccess ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20")}>{uploadSuccess ? <Check size={16} /> : <AlertCircle size={16} />}<p>{uploadSuccess || uploadError}</p></div>)}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"><Users size={16} className="text-primary" /> Live Vacancy Dashboard</h2>
              <button
                onClick={() => { setEditingRoom(null); setRoomFormData({ number: '', block: 'A', capacity: 3, type: 'Boys' }); setIsRoomModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all"
              >
                <Plus size={14} /> Add Room
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {rooms.map(r => {
                const occupancy = allotments.filter(a => a.room?.number === r.number).length;
                const isAvailable = occupancy < r.capacity;
                return (
                  <div key={r.number} className={cn("group p-6 glass-card border-none transition-all cursor-pointer relative overflow-hidden", isAvailable ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "bg-destructive/5 grayscale opacity-60")}>
                    {/* Admin Actions Overlay */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingRoom(r); setRoomFormData({ number: r.number, block: r.block, capacity: r.capacity, type: r.type }); setIsRoomModalOpen(true); }}
                        className="p-1.5 bg-background/80 hover:bg-background text-amber-600 rounded-lg backdrop-blur-md"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRoom(r._id); }}
                        className="p-1.5 bg-background/80 hover:bg-background text-destructive rounded-lg backdrop-blur-md"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className={cn("text-2xl font-black tracking-tighter", isAvailable ? "text-emerald-600" : "text-destructive")}>{r.number}</span>
                      <div className="flex flex-col"><span className="text-[10px] font-bold uppercase text-muted-foreground">{r.capacity} Seater ({r.block})</span><span className={cn("text-[11px] font-extrabold", isAvailable ? "text-emerald-700/70" : "text-destructive/70")}>{isAvailable ? `${r.capacity - occupancy} Beds` : 'Full'}</span></div>
                    </div>
                  </div>
                );
              })}
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
                    <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search student name/ID..." value={checkoutSearchTerm} onChange={(e) => setCheckoutSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-destructive/20 outline-none text-sm" /></div>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                      {allotments.filter(a => a.student?.name.toLowerCase().includes(checkoutSearchTerm.toLowerCase()) || a.student?.id.toLowerCase().includes(checkoutSearchTerm.toLowerCase())).map(a => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 flex-wrap gap-2">
                          <div><p className="text-xs font-bold">{a.student?.name}</p><p className="text-[10px] text-muted-foreground">Room {a.room?.number}</p></div>
                          <button onClick={() => handleDeleteAllotment(a.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div onClick={() => fileInputRef.current?.click()} className={cn("group border-2 border-dashed border-border/60 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-destructive/5 transition-all duration-300", selectedFile && "border-destructive/40 bg-destructive/5")}>
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx,.xls,.csv" className="hidden" />
                      <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-110 transition-transform"><Trash2 size={28} /></div>
                      <div className="text-center"><p className="text-sm font-bold">{selectedFile ? selectedFile.name : 'Bulk Checkout Excel'}</p></div>
                    </div>
                    <button onClick={processBulkCheckout} disabled={isUploading || !selectedFile} className={cn("w-full py-4 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3", selectedFile ? "bg-destructive text-white" : "bg-muted text-muted-foreground")}>{isUploading ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />} Run Bulk Checkout</button>
                  </div>
                )}
                {(uploadSuccess || uploadError) && (<div className={cn("mt-6 p-4 rounded-xl text-xs font-bold flex gap-3", uploadSuccess ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive")}>{uploadSuccess ? <Check size={16} /> : <AlertCircle size={16} />}<p>{uploadSuccess || uploadError}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Re-allot Mess Modal */}
      {editingAllotment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Re-allot Mess</h2>
              <button onClick={() => setEditingAllotment(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Users size={24} /></div>
                <div><p className="font-bold">{editingAllotment.student?.name}</p><p className="text-xs text-muted-foreground">{editingAllotment.student?.id} • Room {editingAllotment.room?.number}</p></div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Select New Mess</label>
                <select className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none transition-all font-medium" defaultValue={editingAllotment.messId} onChange={(e) => handleUpdateMess(editingAllotment.id, e.target.value)}>
                  {availableMesses.map(m => {
                    const id = m.messId || m.name;
                    return <option key={id} value={id}>{m.name} ({id})</option>
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room CRUD Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-background border border-border/50 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
                <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-widest">Configuration Panel</p>
              </div>
              <button onClick={() => setIsRoomModalOpen(false)} className="p-2.5 hover:bg-muted rounded-xl transition-all"><X size={22} /></button>
            </div>

            <form onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Room Number</label>
                  <input
                    type="text"
                    value={roomFormData.number}
                    onChange={(e) => setRoomFormData({ ...roomFormData, number: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/40 outline-none transition-all font-bold"
                    placeholder="e.g. 101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Hostel Block</label>
                  <div className="relative">
                    <input
                      type="text"
                      list="blocks-list"
                      value={roomFormData.block}
                      onChange={(e) => setRoomFormData({ ...roomFormData, block: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/40 outline-none transition-all font-bold"
                      placeholder="Block A"
                    />
                    <datalist id="blocks-list">
                      {uniqueBlocks.map(b => <option key={b} value={b} />)}
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Capacity</label>
                  <select
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value) })}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/40 outline-none transition-all font-bold"
                  >
                    <option value={1}>1 Seater</option>
                    <option value={2}>2 Seater</option>
                    <option value={3}>3 Seater</option>
                    <option value={4}>4 Seater</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Hostel Type</label>
                  <select
                    value={roomFormData.type}
                    onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary/40 outline-none transition-all font-bold"
                  >
                    <option value="Boys">Boys Hostel</option>
                    <option value="Girls">Girls Hostel</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
                {editingRoom ? 'UPDATE ROOM' : 'ADD ROOM'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


