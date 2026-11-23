import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Calendar as CalendarIcon, CheckCircle2, AlertCircle, LogOut, Loader2 } from 'lucide-react';

export default function AttendanceIndex({ attendances, todayAttendance, holidays }: any) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLocating, setIsLocating] = useState(false);
    
    const [alertConfig, setAlertConfig] = useState<{
        type: 'default' | 'destructive';
        title: string;
        message: string;
    } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (alertConfig) {
            const timer = setTimeout(() => setAlertConfig(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [alertConfig]);

    const handleAttendance = (type: 'in' | 'out') => {
        setAlertConfig(null); 
        
        if (type === 'in' && todayAttendance && todayAttendance.clock_out) {
            setAlertConfig({
                type: 'destructive',
                title: 'Aksi Ditolak',
                message: 'Anda sudah menyelesaikan absen hari ini.'
            });
            return;
        }

        setIsLocating(true);

        if (!navigator.geolocation) {
            setAlertConfig({
                type: 'destructive',
                title: 'Fitur Tidak Didukung',
                message: 'Geolokasi tidak didukung oleh browser perangkat Anda.'
            });
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const routeName = type === 'in' ? 'attendances.clock-in' : 'attendances.clock-out';
                
                router.post(route(routeName), { latitude, longitude }, {
                    onSuccess: () => {
                        setAlertConfig({
                            type: 'default',
                            title: 'Berhasil!',
                            message: type === 'in' ? 'Absen masuk berhasil dicatat.' : 'Absen pulang berhasil dicatat.'
                        });
                    },
                    onFinish: () => setIsLocating(false),
                    onError: (errors) => {
                        const errorMessage = Object.values(errors)[0] || "Terjadi kesalahan pada server saat mencatat absensi.";
                        setAlertConfig({
                            type: 'destructive',
                            title: 'Gagal Absen',
                            message: errorMessage as string
                        });
                        setIsLocating(false);
                    }
                });
            },
            (error) => {
                console.error("Geolocation Error: ", error);
                setAlertConfig({
                    type: 'destructive',
                    title: 'Akses Lokasi Ditolak',
                    message: 'Mohon izinkan akses lokasi (GPS) pada browser Anda untuk melakukan absensi.'
                });
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const year = currentTime.getFullYear();
    const month = currentTime.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarCells = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarCells.push(new Date(year, month, i));

    const getAttendanceForDate = (dateObj: Date) => {
        const dateString = dateObj.toLocaleDateString('en-CA'); 
        return attendances?.find((a: any) => a.date.split('T')[0] === dateString);
    };

    const getHolidayForDate = (dateObj: Date) => {
        const dateString = dateObj.toLocaleDateString('en-CA'); 
        return holidays?.find((h: any) => h.date.split('T')[0].split(' ')[0] === dateString);
    };

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    return (
        <AppLayout>
            <Head title="Absensi Karyawan" />
            
            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1400px] mx-auto">
                
                {/* HEADER & ACTION PANEL */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* PANEL KIRI: Info & Waktu */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Presensi Kehadiran</h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">Catat jam masuk dan pulang Anda dengan akurat.</p>
                        
                        <div className="flex items-center gap-4 mt-6">
                            <div className="bg-primary/10 text-primary p-3 md:p-4 rounded-2xl flex items-center gap-3 w-full md:w-auto">
                                <Clock className="size-6 md:size-8 shrink-0" />
                                <div>
                                    <div className="text-2xl md:text-3xl font-bold font-mono tracking-wider">
                                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                    <div className="text-xs md:text-sm font-medium opacity-80">
                                        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PANEL KANAN: Tombol Aksi */}
                    <Card className="bg-muted/30 border-dashed shadow-none">
                        <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center h-full gap-4 text-center">
                            
                            {alertConfig && (
                                <Alert variant={alertConfig.type} className="w-full text-left animate-in fade-in zoom-in duration-300">
                                    {alertConfig.type === 'destructive' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                    <AlertTitle>{alertConfig.title}</AlertTitle>
                                    <AlertDescription>{alertConfig.message}</AlertDescription>
                                </Alert>
                            )}

                            {!todayAttendance ? (
                                <>
                                    <div className="bg-blue-500/10 p-3 rounded-full mb-2">
                                        <Clock className="size-6 text-blue-500" />
                                    </div>
                                    <h3 className="font-semibold">Belum Absen Masuk</h3>
                                    <p className="text-xs text-muted-foreground mb-2">Silakan klik tombol di bawah untuk mencatat kehadiran Anda hari ini.</p>
                                    <Button 
                                        size="lg" 
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                                        onClick={() => handleAttendance('in')}
                                        disabled={isLocating}
                                    >
                                        {isLocating ? <><Loader2 className="size-4 mr-2 animate-spin" /> Memeriksa Lokasi...</> : "Absen Masuk (Clock In)"}
                                    </Button>
                                </>
                            ) : !todayAttendance.clock_out ? (
                                <>
                                    <div className="bg-orange-500/10 p-3 rounded-full mb-2">
                                        <LogOut className="size-6 text-orange-500" />
                                    </div>
                                    <h3 className="font-semibold">Sedang Bekerja</h3>
                                    <p className="text-xs text-muted-foreground mb-2">Anda masuk pada pukul <span className="font-bold text-foreground">{new Date(todayAttendance.clock_in).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span></p>
                                    <Button 
                                        size="lg" 
                                        variant="destructive" 
                                        className="w-full" 
                                        onClick={() => handleAttendance('out')}
                                        disabled={isLocating}
                                    >
                                        {isLocating ? <><Loader2 className="size-4 mr-2 animate-spin" /> Memeriksa Lokasi...</> : "Absen Pulang (Clock Out)"}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-green-500/10 p-3 rounded-full mb-2">
                                        <CheckCircle2 className="size-6 text-green-500" />
                                    </div>
                                    <h3 className="font-semibold text-green-600">Selesai Bekerja</h3>
                                    <p className="text-xs text-muted-foreground">Terima kasih atas kerja keras Anda hari ini. Selamat beristirahat!</p>
                                    <div className="grid grid-cols-2 gap-2 w-full mt-4 text-sm bg-background border p-3 rounded-lg">
                                        <div><span className="text-muted-foreground text-xs block">Masuk</span>{new Date(todayAttendance.clock_in).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                                        <div><span className="text-muted-foreground text-xs block">Pulang</span>{new Date(todayAttendance.clock_out).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <hr className="my-2" />

                {/* AREA KALENDER GRID */}
                <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="size-5 text-muted-foreground shrink-0" />
                    <h2 className="text-lg md:text-xl font-bold">Riwayat Bulan {monthNames[month]} {year}</h2>
                </div>

                <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                    {/* Header Hari (Senin-Minggu) */}
                    <div className="grid grid-cols-7 border-b bg-muted/50">
                        {dayNames.map((day, index) => (
                            // Index 0 = Minggu, Index 6 = Sabtu. Keduanya ditandai warna merah.
                            <div key={day} className={`py-2 md:py-3 text-center text-xs md:text-sm font-semibold ${index === 0 || index === 6 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                <span className="md:hidden">{day.charAt(0)}</span>
                                <span className="hidden md:inline">{day}</span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Tanggal */}
                    <div className="grid grid-cols-7 auto-rows-fr">
                        {calendarCells.map((dateObj, index) => {
                            if (!dateObj) {
                                return <div key={`empty-${index}`} className="min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-r border-b bg-muted/20" />;
                            }

                            const isToday = dateObj.toLocaleDateString() === new Date().toLocaleDateString();
                            const record = getAttendanceForDate(dateObj);
                            const holidayInfo = getHolidayForDate(dateObj);
                            
                            // Logika mendeteksi tanggal merah (Sabtu=6, Minggu=0, atau ada data holiday)
                            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                            const isDayOff = isWeekend || holidayInfo;

                            // HANYA tampilkan teks jika ada data dari API
                            const displayHolidayText = holidayInfo ? holidayInfo.name : null;
                            
                            return (
                                <div key={index} className={`min-h-[90px] md:min-h-[120px] p-1 md:p-3 border-r border-b flex flex-col gap-1 md:gap-2 transition-colors hover:bg-muted/10 ${isToday ? 'bg-primary/5' : isDayOff ? 'bg-red-50/10' : ''}`}>
                                    {/* Angka Tanggal */}
                                    <div className="flex justify-between items-start">
                                        <span className={`text-xs md:text-sm font-medium size-5 md:size-7 flex items-center justify-center rounded-full 
                                            ${isToday ? 'bg-primary text-primary-foreground' : isDayOff ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}>
                                            {dateObj.getDate()}
                                        </span>
                                        {record && record.status === 'late' && (
                                            <AlertCircle className="size-3 md:size-4 text-orange-500 shrink-0" title="Terlambat" />
                                        )}
                                    </div>

                                    {/* Info Keterangan Libur DARI API */}
                                    {displayHolidayText && (
                                        <div className="text-[8px] md:text-[10px] text-red-600 font-semibold leading-tight text-center bg-red-100/50 rounded flex-grow-0 px-1 py-0.5 mt-0.5 line-clamp-2">
                                            {displayHolidayText}
                                        </div>
                                    )}

                                    {/* Badge Status & Jam */}
                                    {record ? (
                                        <div className="flex flex-col gap-1 md:gap-1.5 mt-auto">
                                            <Badge variant="outline" className={`w-full justify-center font-mono text-[9px] md:text-xs px-0.5 md:px-2 py-0.5 md:py-1 leading-none ${record.status === 'late' ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-green-500 text-green-600 bg-green-50'}`}>
                                                <span className="hidden md:inline">IN: </span>{new Date(record.clock_in).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                            </Badge>
                                            
                                            {record.clock_out ? (
                                                <Badge variant="outline" className="w-full justify-center font-mono text-[9px] md:text-xs px-0.5 md:px-2 py-0.5 md:py-1 leading-none border-slate-300 text-slate-600 bg-slate-50">
                                                    <span className="hidden md:inline">OUT: </span>{new Date(record.clock_out).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="w-full justify-center font-mono text-[9px] md:text-xs px-0.5 md:px-2 py-0.5 md:py-1 leading-none opacity-50">
                                                    -- : --
                                                </Badge>
                                            )}
                                        </div>
                                    ) : (
                                        // Pastikan hari kerja biasa mendapat alpha jika bolos
                                        dateObj < new Date() && !isToday && !isDayOff ? (
                                            <div className="mt-auto">
                                                <Badge variant="destructive" className="w-full justify-center text-[8px] md:text-[10px] px-0.5 md:px-2 py-0.5 md:py-1 leading-none opacity-80">
                                                    <span className="md:hidden">Alpha</span>
                                                    <span className="hidden md:inline">Tidak Hadir</span>
                                                </Badge>
                                            </div>
                                        ) : null
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}