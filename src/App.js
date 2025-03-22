import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    FileText,
    User,
    Calendar,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    CheckCircle,
    AlertTriangle,
    Loader2,
    List,
    LogOut,
    Menu as MenuIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Mock data for initial setup (replace with API calls in a real application)
const mockPatients = [
    { id: '1', name: 'John Doe', dob: '1990-05-15', gender: 'Male', mrn: '12345' },
    { id: '2', name: 'Jane Smith', dob: '1985-10-22', gender: 'Female', mrn: '67890' },
    { id: '3', name: 'Robert Jones', dob: '2002-03-08', gender: 'Male', mrn: '24680' },
    { id: '4', name: 'Alice Brown', dob: '1998-12-01', gender: 'Female', mrn: '13579' },
    { id: '5', name: 'Michael Davis', dob: '1976-07-19', gender: 'Male', mrn: '98765' },
];

const mockVisits = [
    {
        id: 'v1',
        patientId: '1',
        date: '2024-01-10',
        chiefComplaint: 'Fever and cough',
        diagnosis: 'Influenza',
        notes: 'Patient presented with a high fever and persistent cough.  Prescribed Tamiflu and advised to rest.',
        medications: ['Tamiflu 75mg BID x 5 days'],
        vitals: { temperature: 39.2, heartRate: 110, bloodPressure: '130/80' },
    },
    {
        id: 'v2',
        patientId: '1',
        date: '2024-01-15',
        chiefComplaint: 'Follow-up visit',
        diagnosis: 'Influenza',
        notes: 'Patient reports improvement in symptoms. Fever subsided. Continue medication as prescribed.',
        medications: ['Tamiflu 75mg BID x 5 days'],
        vitals: { temperature: 37.0, heartRate: 80, bloodPressure: '120/70' },
    },
    {
        id: 'v3',
        patientId: '2',
        date: '2024-02-01',
        chiefComplaint: 'Abdominal pain',
        diagnosis: 'Appendicitis',
        notes: 'Patient presented with severe right lower quadrant pain.  CT scan confirmed appendicitis.  Scheduled for surgery.',
        medications: ['IV fluids', 'Ceftriaxone 1g IV'],
        vitals: { temperature: 38.5, heartRate: 100, bloodPressure: '140/90' },
    },
    {
        id: 'v4',
        patientId: '3',
        date: '2024-02-15',
        chiefComplaint: 'Headache',
        diagnosis: 'Migraine',
        notes: 'Patient reports severe headache with nausea.  Prescribed sumatriptan.',
        medications: ['Sumatriptan 100mg PRN'],
        vitals: { temperature: 37.2, heartRate: 72, bloodPressure: '110/70' },
    },
    {
        id: 'v5',
        patientId: '4',
        date: '2024-03-01',
        chiefComplaint: 'Chest pain',
        diagnosis: 'GERD',
        notes: 'Patient reports chest pain, worse after eating.  Prescribed omeprazole.',
        medications: ['Omeprazole 20mg daily'],
        vitals: { temperature: 36.8, heartRate: 78, bloodPressure: '125/80' },
    },
    {
        id: 'v6',
        patientId: '5',
        date: '2024-03-10',
        chiefComplaint: 'Rash',
        diagnosis: 'Allergic reaction',
        notes: 'Patient presented with a widespread rash after taking new medication.  Discontinued medication and prescribed antihistamines.',
        medications: ['Cetirizine 10mg daily'],
        vitals: { temperature: 37.5, heartRate: 85, bloodPressure: '130/85' },
    },
    {
        id: 'v7',
        patientId: '2',
        date: '2024-02-03',
        chiefComplaint: 'Post-operative check',
        diagnosis: 'Appendicitis',
        notes: 'Patient recovering well from appendectomy.  Wound clean and dry.  Discharge instructions given.',
        medications: ['Pain medication PRN'],
        vitals: { temperature: 37.0, heartRate: 75, bloodPressure: '120/80' },
    },
];

// Form schema using Zod
const visitFormSchema = z.object({
    date: z.date(),
    chiefComplaint: z.string().min(1, 'Chief complaint is required'),
    diagnosis: z.string().min(1, 'Diagnosis is required'),
    notes: z.string().min(1, 'Notes are required'),
    medications: z.array(z.string()).min(1, 'At least one medication is required'),
    vitals: z.object({
        temperature: z.number().optional(),
        heartRate: z.number().optional(),
        bloodPressure: z.string().optional(),
    }),
});

// React Hook Form type
type VisitFormValues = z.infer<typeof visitFormSchema>;

// Animation Variants
const listItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
};

// Sub-Components

// Displays Patient Information
const PatientInfo = ({ patient }: { patient: typeof mockPatients[0] | null }) => {
    if (!patient) {
        return <div className="text-gray-500">Select a patient to view details.</div>;
    }
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Patient Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="font-semibold">Name:</span>
                        <span className="ml-2">{patient.name}</span>
                    </div>
                    <div>
                        <span className="font-semibold">MRN:</span>
                        <span className="ml-2">{patient.mrn}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Date of Birth:</span>
                        <span className="ml-2">{format(parseISO(patient.dob), 'PPP')}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Gender:</span>
                        <span className="ml-2">{patient.gender}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Displays and manages a single visit
const VisitDetails = ({
    visit,
    onUpdate,
    onDelete,
    isEditing,
    onStartEdit,
    onCancelEdit,
    patient,
    onAddMedication,
    onRemoveMedication,
}: {
    visit: typeof mockVisits[0] | null;
    onUpdate: (id: string, updates: Partial<typeof mockVisits[0]>) => void;
    onDelete: (id: string) => void;
    isEditing: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    patient: typeof mockPatients[0] | null;
    onAddMedication: (visitId: string) => void;
    onRemoveMedication: (visitId: string, index: number) => void;
}) => {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<VisitFormValues>({
        resolver: zodResolver(visitFormSchema),
        defaultValues: visit
            ? {
                  date: parseISO(visit.date),
                  chiefComplaint: visit.chiefComplaint,
                  diagnosis: visit.diagnosis,
                  notes: visit.notes,
                  medications: visit.medications,
                  vitals: visit.vitals || { temperature: undefined, heartRate: undefined, bloodPressure: undefined },
              }
            : {},
    });

    useEffect(() => {
        if (visit && isEditing) {
            reset({
                date: parseISO(visit.date),
                chiefComplaint: visit.chiefComplaint,
                diagnosis: visit.diagnosis,
                notes: visit.notes,
                medications: visit.medications,
                vitals: visit.vitals || { temperature: undefined, heartRate: undefined, bloodPressure: undefined },
            });
        }
    }, [visit, isEditing, reset]);

    const onSubmit = (data: VisitFormValues) => {
        if (visit) {
            onUpdate(visit.id, {
                date: format(data.date, 'yyyy-MM-dd'),
                chiefComplaint: data.chiefComplaint,
                diagnosis: data.diagnosis,
                notes: data.notes,
                medications: data.medications,
                vitals: data.vitals,
            });
        }
    };

    if (!visit) {
        return <div className="text-gray-500">Select a visit to view details.</div>;
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Visit Details - {format(parseISO(visit.date), 'PPP')}
                    </div>
                    {!isEditing ? (
                        <div className="space-x-2">
                            <Button variant="outline" size="sm" onClick={onStartEdit}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Visit</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete this visit? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={onCancelEdit}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                onDelete(visit.id);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onCancelEdit}
                                disabled={isSubmitting}
                            >
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" /> Save
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold block mb-1">Date:</label>
                                <Controller
                                    name="date"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="date"
                                            {...field}
                                            onChange={(e) => field.onChange(parseISO(e.target.value))}
                                            className={errors.date ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Chief Complaint:</label>
                                <Textarea
                                    {...register('chiefComplaint')}
                                    className={errors.chiefComplaint ? 'border-red-500' : ''}
                                />
                                {errors.chiefComplaint && (
                                    <p className="text-red-500 text-sm mt-1">{errors.chiefComplaint.message}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold block mb-1">Diagnosis:</label>
                            <Textarea {...register('diagnosis')} className={errors.diagnosis ? 'border-red-500' : ''} />
                            {errors.diagnosis && (
                                <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="font-semibold block mb-1">Notes:</label>
                            <Textarea {...register('notes')} className={errors.notes ? 'border-red-500' : ''} />
                            {errors.notes && (
                                <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="font-semibold block mb-2">Medications:</label>
                            {visit.medications.map((med, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <Input value={med} readOnly className="flex-1" />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => onRemoveMedication(visit.id, index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddMedication(visit.id)}
                                className="mt-2"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Medication
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="font-semibold block mb-1">Temperature (°C):</label>
                                <Input
                                    type="number"
                                    {...register('vitals.temperature', { valueAsNumber: true })}
                                    className={errors.vitals?.temperature ? 'border-red-500' : ''}
                                />
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Heart Rate (bpm):</label>
                                <Input
                                    type="number"
                                    {...register('vitals.heartRate', { valueAsNumber: true })}
                                    className={errors.vitals?.heartRate ? 'border-red-500' : ''}
                                />
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Blood Pressure (mmHg):</label>
                                <Input
                                    {...register('vitals.bloodPressure')}
                                    className={errors.vitals?.bloodPressure ? 'border-red-500' : ''}
                                />
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold">Date:</span>
                                <span className="ml-2">{format(parseISO(visit.date), 'PPP')}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Chief Complaint:</span>
                                <span className="ml-2">{visit.chiefComplaint}</span>
                            </div>
                        </div>
                        <div>
                            <span className="font-semibold">Diagnosis:</span>
                            <span className="ml-2">{visit.diagnosis}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Notes:</span>
                            <span className="ml-2">{visit.notes}</span>
                        </div>
                        <div>
                            <span className="font-semibold">Medications:</span>
                            <ul className="list-disc list-inside">
                                {visit.medications.map((med, index) => (
                                    <li key={index}>{med}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <span className="font-semibold">Temperature (°C):</span>
                                <span className="ml-2">{visit.vitals?.temperature || '-'}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Heart Rate (bpm):</span>
                                <span className="ml-2">{visit.vitals?.heartRate || '-'}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Blood Pressure (mmHg):</span>
                                <span className="ml-2">{visit.vitals?.bloodPressure || '-'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Main App Component
const EMRApp = () => {
    const [patients, setPatients] = useState(mockPatients);
    const [visits, setVisits] = useState(mockVisits);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
    const [isEditingVisit, setIsEditingVisit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile menu

    // --- Patient Management ---
    const selectedPatient = patients.find((p) => p.id === selectedPatientId);

    // --- Visit Management ---
    const selectedVisit = visits.find((v) => v.id === selectedVisitId);

    const handleVisitSelect = (visitId: string) => {
        setSelectedVisitId(visitId);
        setIsEditingVisit(false); // Reset editing state when selecting a new visit
    };

    const handleUpdateVisit = (id: string, updates: Partial<typeof mockVisits[0]>) => {
        setVisits(
            visits.map((visit) => (visit.id === id ? { ...visit, ...updates } : visit))
        );
        setIsEditingVisit(false); // Exit edit mode after saving
    };

    const handleDeleteVisit = (id: string) => {
        setVisits(visits.filter((visit) => visit.id !== id));
        setSelectedVisitId(null);
        setIsEditingVisit(false);
    };

    const handleStartEditVisit = () => {
        setIsEditingVisit(true);
    };

    const handleCancelEditVisit = () => {
        setIsEditingVisit(false);
    };

    const handleAddVisit = (patientId: string) => {
        const newVisit: typeof mockVisits[0] = {
            id: `v${Date.now()}`, // Simple ID generation
            patientId,
            date: format(new Date(), 'yyyy-MM-dd'),
            chiefComplaint: '',
            diagnosis: '',
            notes: '',
            medications: [],
            vitals: {},
        };
        setVisits([...visits, newVisit]);
        setSelectedVisitId(newVisit.id);
        setIsEditingVisit(true); // Start editing the new visit immediately
    };

    const handleAddMedication = (visitId: string) => {
        setVisits(
            visits.map((visit) =>
                visit.id === visitId ? { ...visit, medications: [...visit.medications, ''] } : visit
            )
        );
    };

    const handleRemoveMedication = (visitId: string, index: number) => {
        setVisits(
            visits.map((visit) =>
                visit.id === visitId
                    ? { ...visit, medications: visit.medications.filter((_, i) => i !== index) }
                    : visit
            )
        );
    };

    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mrn.includes(searchTerm)
    );

    // --- Handlers ---
    const handlePatientSelect = (patientId: string) => {
        setSelectedPatientId(patientId);
        setSelectedVisitId(null); // Clear selected visit when selecting a new patient
        setIsSidebarOpen(false); // Close sidebar on mobile
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleLogout = () => {
        // In a real app, you'd clear authentication tokens, etc.
        setSelectedPatientId(null);
        setSelectedVisitId(null);
        setPatients([]);
        setVisits([]);
        alert('Logged out!');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar (Patient List) */}
            <div
                className={cn(
                    'bg-white w-64 border-r border-gray-200 transition-transform duration-300 ease-in-out md:translate-x-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full' // Mobile menu
                )}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Patients</h2>
                        {/* Mobile menu close button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    <Input
                        type="text"
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="mb-4"
                    />
                    <ul className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <AnimatePresence>
                            {filteredPatients.map((patient) => (
                                <motion.li
                                    key={patient.id}
                                    variants={listItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    whileHover={{ scale: 1.02, backgroundColor: '#f0f0f0' }}
                                    transition={{ type: 'tween' }}
                                >
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            'w-full justify-start',
                                            selectedPatientId === patient.id ? 'bg-blue-100 text-blue-600' : ''
                                        )}
                                        onClick={() => handlePatientSelect(patient.id)}
                                    >
                                        {patient.name}
                                    </Button>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                    <div className="mt-4">
                        <Button variant="outline" className="w-full" onClick={() => {
                            const newPatient = {
                                id: `p${Date.now()}`,
                                name: 'New Patient',
                                dob: '2000-01-01',
                                gender: 'Other',
                                mrn: Math.floor(Math.random() * 100000).toString()
                            }
                            setPatients([...patients, newPatient]);
                            handlePatientSelect(newPatient.id);
                        }}>
                            <Plus className='mr-2 w-4 h-4' />
                            Add Patient
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 overflow-y-auto">
                {/* Mobile menu button */}
                <div className="md:hidden mb-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <MenuIcon className="w-6 h-6" />
                    </Button>
                </div>

                <div className="mb-6">
                    <PatientInfo patient={selectedPatient} />
                </div>

                {selectedPatient && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Visits</h2>
                            <Button
                                variant="outline"
                                onClick={() => handleAddVisit(selectedPatient.id)}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Visit
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {selectedPatient && visits.filter(v => v.patientId === selectedPatient.id).length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Chief Complaint</TableHead>
                                            <TableHead>Diagnosis</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {visits
                                            .filter((visit) => visit.patientId === selectedPatient.id)
                                            .map((visit) => (
                                                <TableRow
                                                    key={visit.id}
                                                    className={selectedVisitId === visit.id ? 'bg-blue-100' : ''}
                                                >
                                                    <TableCell>{format(parseISO(visit.date), 'PPP')}</TableCell>
                                                    <TableCell>{visit.chiefComplaint}</TableCell>
                                                    <TableCell>{visit.diagnosis}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="link"
                                                            onClick={() => handleVisitSelect(visit.id)}
                                                        >
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-gray-500">No visits recorded for this patient.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Visit Details Section */}
                {selectedVisit && (
                    <VisitDetails
                        visit={selectedVisit}
                        onUpdate={handleUpdateVisit}
                        onDelete={handleDeleteVisit}
                        isEditing={isEditingVisit}
                        onStartEdit={handleStartEditVisit}
                        onCancelEdit={handleCancelEditVisit}
                        patient={selectedPatient}
                        onAddMedication={handleAddMedication}
                        onRemoveMedication={handleRemoveMedication}
                    />
                )}
            </div>
        </div>
    );
};

export default EMRApp;
