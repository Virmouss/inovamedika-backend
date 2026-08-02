require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
    console.log('🌱 Starting database seeding with dummy data...\n');

    try {
        const defaultPassword = 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // ----------------------------------------------------
        // 1. Seed Doctors (3 doctors)
        // ----------------------------------------------------
        console.log('Inserting 3 Doctors...');
        const doctorsData = [
            { name: 'Dr. Budi Santoso, Sp.PD', spesialis: 'Penyakit Dalam' },
            { name: 'Dr. Siti Nurhaliza, Sp.A', spesialis: 'Spesialis Anak' },
            { name: 'Dr. Hendra Wijaya, Sp.JP', spesialis: 'Jantung & Pembuluh Darah' }
        ];

        const doctorIds = [];
        for (const doc of doctorsData) {
            let res = await db.query(
                `INSERT INTO DOCTORS (name, spesialis) VALUES ($1, $2) RETURNING id`,
                [doc.name, doc.spesialis]
            );
            doctorIds.push(res.rows[0].id);
        }
        console.log(`✓ 3 Doctors created with IDs: ${doctorIds.join(', ')}`);

        // ----------------------------------------------------
        // 2. Seed Users (1 Admin, 3 Doctors, 2 Registrators)
        // ----------------------------------------------------
        console.log('\nInserting Users (1 Admin, 3 Doctors, 2 Registrators)...');
        const usersData = [
            // 1 Admin
            { username: 'admin', role: 'Admin', doctor_id: null },
            // 3 Doctors
            { username: 'budi', role: 'Doctor', doctor_id: doctorIds[0] },
            { username: 'siti', role: 'Doctor', doctor_id: doctorIds[1] },
            { username: 'hendra', role: 'Doctor', doctor_id: doctorIds[2] },
            // 2 Registrators
            { username: 'registrator1', role: 'Registrator', doctor_id: null },
            { username: 'registrator2', role: 'Registrator', doctor_id: null },
        ];

        for (const u of usersData) {
            await db.query(
                `INSERT INTO USERS (username, password, role, doctor_id)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (username) DO UPDATE
                 SET password = EXCLUDED.password, role = EXCLUDED.role, doctor_id = EXCLUDED.doctor_id`,
                [u.username, hashedPassword, u.role, u.doctor_id]
            );
        }
        console.log('✓ 6 Users inserted/updated successfully.');

        // ----------------------------------------------------
        // 3. Seed Patients (25 patients)
        // ----------------------------------------------------
        console.log('\nInserting 25 Patients...');
        const patientsData = [
            { nik: '3201012301850001', nama: 'Ahmad Fauzi', kelamin: 'Laki-laki', tanggal_lahir: '1985-01-23', nomor_telepon: '081234567890', alamat: 'Jl. Merdeka No. 45, Jakarta Pusat' },
            { nik: '3201021404900002', nama: 'Dewi Lestari', kelamin: 'Perempuan', tanggal_lahir: '1990-04-14', nomor_telepon: '081298765432', alamat: 'Jl. Sudirman No. 12, Bandung' },
            { nik: '3201030508780003', nama: 'Bambang Pratama', kelamin: 'Laki-laki', tanggal_lahir: '1978-08-05', nomor_telepon: '081345678901', alamat: 'Jl. Diponegoro No. 88, Surabaya' },
            { nik: '3201041912950004', nama: 'Rina Kartika', kelamin: 'Perempuan', tanggal_lahir: '1995-12-19', nomor_telepon: '081398765432', alamat: 'Jl. Pahlawan No. 23, Yogyakarta' },
            { nik: '3201051103880005', nama: 'Eko Prasetyo', kelamin: 'Laki-laki', tanggal_lahir: '1988-03-11', nomor_telepon: '081456789012', alamat: 'Jl. Malioboro No. 56, Semarang' },
            { nik: '3201062707920006', nama: 'Maya Indah', kelamin: 'Perempuan', tanggal_lahir: '1992-07-27', nomor_telepon: '081498765432', alamat: 'Jl. Gajah Mada No. 101, Medan' },
            { nik: '3201070309800007', nama: 'Agus Setiawan', kelamin: 'Laki-laki', tanggal_lahir: '1980-09-03', nomor_telepon: '081567890123', alamat: 'Jl. Hayam Wuruk No. 14, Bali' },
            { nik: '3201081502830008', nama: 'Sri Rahayu', kelamin: 'Perempuan', tanggal_lahir: '1983-02-15', nomor_telepon: '081598765432', alamat: 'Jl. Cendrawasih No. 7, Makassar' },
            { nik: '3201092006750009', nama: 'Hendro Kusumo', kelamin: 'Laki-laki', tanggal_lahir: '1975-06-20', nomor_telepon: '081678901234', alamat: 'Jl. Kartini No. 33, Palembang' },
            { nik: '3201101811980010', nama: 'Fitri Handayani', kelamin: 'Perempuan', tanggal_lahir: '1998-11-18', nomor_telepon: '081698765432', alamat: 'Jl. Imam Bonjol No. 62, Padang' },
            { nik: '3201110905010011', nama: 'Rizky Ramadhan', kelamin: 'Laki-laki', tanggal_lahir: '2001-05-09', nomor_telepon: '081789012345', alamat: 'Jl. Thamrin No. 9, Bogor' },
            { nik: '3201122208940012', nama: 'Putri Wulandari', kelamin: 'Perempuan', tanggal_lahir: '1994-08-22', nomor_telepon: '081798765432', alamat: 'Jl. Asia Afrika No. 18, Depok' },
            { nik: '3201131401820013', nama: 'Dedi Supriyadi', kelamin: 'Laki-laki', tanggal_lahir: '1982-01-14', nomor_telepon: '081890123456', alamat: 'Jl. Gatot Subroto No. 74, Tangerang' },
            { nik: '3201140610960014', nama: 'Anisa Nurul', kelamin: 'Perempuan', tanggal_lahir: '1996-10-06', nomor_telepon: '081898765432', alamat: 'Jl. Pemuda No. 40, Bekasi' },
            { nik: '3201153004890015', nama: 'Tri Wahyuni', kelamin: 'Perempuan', tanggal_lahir: '1989-04-30', nomor_telepon: '081901234567', alamat: 'Jl. Veteran No. 15, Surakarta' },
            { nik: '3201161206770016', nama: 'Joko Widodo', kelamin: 'Laki-laki', tanggal_lahir: '1977-06-12', nomor_telepon: '081998765432', alamat: 'Jl. Dr. Sutomo No. 51, Malang' },
            { nik: '3201172509930017', nama: 'Mega Utami', kelamin: 'Perempuan', tanggal_lahir: '1993-09-25', nomor_telepon: '082112345678', alamat: 'Jl. Basuki Rahmat No. 29, Cirebon' },
            { nik: '3201180802870018', nama: 'Faisal Akbar', kelamin: 'Laki-laki', tanggal_lahir: '1987-02-08', nomor_telepon: '082198765432', alamat: 'Jl. Sultan Agung No. 66, Balikpapan' },
            { nik: '3201191705910019', nama: 'Ratna Sari', kelamin: 'Perempuan', tanggal_lahir: '1991-05-17', nomor_telepon: '082223456789', alamat: 'Jl. Urip Sumoharjo No. 80, Samarinda' },
            { nik: '3201202812840020', nama: 'Bayu Nugroho', kelamin: 'Laki-laki', tanggal_lahir: '1984-12-28', nomor_telepon: '082298765432', alamat: 'Jl. Ahmad Yani No. 11, Pontianak' },
            { nik: '3201211507990021', nama: 'Sinta Bella', kelamin: 'Perempuan', tanggal_lahir: '1999-07-15', nomor_telepon: '082334567890', alamat: 'Jl. Teuku Umar No. 92, Pekanbaru' },
            { nik: '3201220403860022', nama: 'Surya Saputra', kelamin: 'Laki-laki', tanggal_lahir: '1986-03-04', nomor_telepon: '082398765432', alamat: 'Jl. Raden Intan No. 37, Bandar Lampung' },
            { nik: '3201232110970023', nama: 'Linda Permata', kelamin: 'Perempuan', tanggal_lahir: '1997-10-21', nomor_telepon: '082445678901', alamat: 'Jl. Hang Tuah No. 5, Batam' },
            { nik: '3201241001810024', nama: 'Arif Hidayat', kelamin: 'Laki-laki', tanggal_lahir: '1981-01-10', nomor_telepon: '082498765432', alamat: 'Jl. Pattimura No. 19, Ambon' },
            { nik: '3201252909940025', nama: 'Nur Aini', kelamin: 'Perempuan', tanggal_lahir: '1994-09-29', nomor_telepon: '082556789012', alamat: 'Jl. Sam Ratulangi No. 44, Manado' },
        ];

        const patientIds = [];
        for (const p of patientsData) {
            let res = await db.query(
                `INSERT INTO PATIENTS (nik, nama, kelamin, tanggal_lahir, nomor_telepon, alamat)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (nik) DO UPDATE
                 SET nama = EXCLUDED.nama, kelamin = EXCLUDED.kelamin, tanggal_lahir = EXCLUDED.tanggal_lahir, nomor_telepon = EXCLUDED.nomor_telepon, alamat = EXCLUDED.alamat
                 RETURNING id`,
                [p.nik, p.nama, p.kelamin, p.tanggal_lahir, p.nomor_telepon, p.alamat]
            );
            patientIds.push(res.rows[0].id);
        }
        console.log(`✓ 25 Patients inserted/updated with IDs.`);

        // ----------------------------------------------------
        // 4. Seed Today's Queue & Appointments
        // ----------------------------------------------------
        console.log("\nInserting Today's Appointments & Queue Data...");
        const today = new Date().toISOString().split('T')[0];

        const todayAppointments = [
            {
                patient_id: patientIds[0],
                doctor_id: doctorIds[0],
                poli: 'Poli Penyakit Dalam',
                keluhan_awal: 'Demam tinggi 3 hari dan mual muntah',
                jenis_pembayaran: 'BPJS',
                queue_number: 'A-001',
                status_kunjungan: 'called',
                jadwal_kunjungan: `${today} 08:30:00`
            },
            {
                patient_id: patientIds[1],
                doctor_id: doctorIds[1],
                poli: 'Poli Anak',
                keluhan_awal: 'Batuk pilek dan nafsu makan menurun',
                jenis_pembayaran: 'Umum',
                queue_number: 'A-002',
                status_kunjungan: 'waiting',
                jadwal_kunjungan: `${today} 09:00:00`
            },
            {
                patient_id: patientIds[2],
                doctor_id: doctorIds[2],
                poli: 'Poli Jantung',
                keluhan_awal: 'Dada berdebar dan sesak saat berjalan jauh',
                jenis_pembayaran: 'Asuransi Swasta',
                queue_number: 'A-003',
                status_kunjungan: 'waiting',
                jadwal_kunjungan: `${today} 09:30:00`
            },
            {
                patient_id: patientIds[3],
                doctor_id: doctorIds[0],
                poli: 'Poli Penyakit Dalam',
                keluhan_awal: 'Nyeri ulu hati kronis, perut kembung',
                jenis_pembayaran: 'BPJS',
                queue_number: 'A-004',
                status_kunjungan: 'waiting',
                jadwal_kunjungan: `${today} 10:00:00`
            },
            {
                patient_id: patientIds[4],
                doctor_id: doctorIds[1],
                poli: 'Poli Anak',
                keluhan_awal: 'Imunisasi DPT lanjutan dan konsultasi tumbuh kembang',
                jenis_pembayaran: 'Umum',
                queue_number: 'A-005',
                status_kunjungan: 'waiting',
                jadwal_kunjungan: `${today} 10:30:00`
            }
        ];

        for (const appt of todayAppointments) {
            await db.query(
                `INSERT INTO APPOINTMENTS 
                    (patient_id, doctor_id, poli, keluhan_awal, jenis_pembayaran, queue_number, status_kunjungan, jadwal_kunjungan)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    appt.patient_id, appt.doctor_id, appt.poli,
                    appt.keluhan_awal, appt.jenis_pembayaran,
                    appt.queue_number, appt.status_kunjungan, appt.jadwal_kunjungan
                ]
            );
        }
        console.log("✓ Today's queue and appointments inserted.");

        // ----------------------------------------------------
        // 5. Seed Historical Medical Records & Prescriptions
        // ----------------------------------------------------
        console.log('\nInserting Sample Medical Records and Prescriptions...');
        const medicalRecordData = [
            {
                patient_id: patientIds[5],
                doctor_id: doctorIds[0],
                visit_date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
                keluhan_awal: 'Pusing berputar dan tengkuk terasa berat',
                tekanan_darah: '140/90 mmHg',
                suhu_tubuh: 36.6,
                berat_badan: 65.5,
                diagnosa: 'Hipertensi Stage 1',
                rencana_terapi: 'Diet rendah garam, istirahat cukup, medikamentosa antihipertensi',
                tindakan_medis: 'Pemeriksaan tanda vital, edukasi gaya hidup sehat',
                prescriptions: [
                    { obat: 'Amlodipine 5mg', dosis: '1x1 tablet', instruksi: 'Diminum pagi hari setelah makan' },
                    { obat: 'Vitamin B Kompleks', dosis: '1x1 tablet', instruksi: 'Diminum siang hari' }
                ]
            },
            {
                patient_id: patientIds[6],
                doctor_id: doctorIds[1],
                visit_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
                keluhan_awal: 'Demam 2 hari disertai ruam merah di kulit',
                tekanan_darah: '100/70 mmHg',
                suhu_tubuh: 38.4,
                berat_badan: 24.0,
                diagnosa: 'Morbili / Campak',
                rencana_terapi: 'Antipiretik, suplementasi Vitamin A, hidrasi cairan yang cukup',
                tindakan_medis: 'Pemeriksaan fisik anak komprehensif',
                prescriptions: [
                    { obat: 'Paracetamol Sirup 120mg/5ml', dosis: '3x1 sendok takar', instruksi: 'Bila demam di atas 38C' },
                    { obat: 'Vitamin A 200.000 IU', dosis: '1 kapsul', instruksi: 'Diberikan dosis tunggal' }
                ]
            },
            {
                patient_id: patientIds[7],
                doctor_id: doctorIds[2],
                visit_date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
                keluhan_awal: 'Sesak nafas saat beraktivitas berat dan mudah lelah',
                tekanan_darah: '130/85 mmHg',
                suhu_tubuh: 36.5,
                berat_badan: 70.0,
                diagnosa: 'Coronary Artery Disease (CAD) suspect',
                rencana_terapi: 'Pemeriksaan EKG rutin, evaluasi profil lipid dan treadmill test',
                tindakan_medis: 'Rekam Jantung (EKG 12-lead)',
                prescriptions: [
                    { obat: 'ISDN 5mg', dosis: '1 tablet sublingual', instruksi: 'Di bawah lidah jika dada terasa nyeri' },
                    { obat: 'Atorvastatin 20mg', dosis: '1x1 tablet', instruksi: 'Diminum malam hari sebelum tidur' }
                ]
            }
        ];

        for (const mr of medicalRecordData) {
            const resepSummary = mr.prescriptions.map((p, idx) => `${idx + 1}. ${p.obat} (${p.dosis}) - ${p.instruksi}`).join('\n');
            const mrRes = await db.query(
                `INSERT INTO MEDICAL_RECORDS
                    (patient_id, doctor_id, visit_date, keluhan_awal, tekanan_darah, suhu_tubuh, berat_badan, diagnosa, rencana_terapi, tindakan_medis, resep_obat)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 RETURNING id`,
                [
                    mr.patient_id, mr.doctor_id, mr.visit_date, mr.keluhan_awal,
                    mr.tekanan_darah, mr.suhu_tubuh, mr.berat_badan, mr.diagnosa,
                    mr.rencana_terapi, mr.tindakan_medis, resepSummary
                ]
            );
            const medicalRecordId = mrRes.rows[0].id;

            for (const p of mr.prescriptions) {
                await db.query(
                    `INSERT INTO PRESCRIPTIONS (medical_record_id, obat, dosis, instruksi)
                     VALUES ($1, $2, $3, $4)`,
                    [medicalRecordId, p.obat, p.dosis, p.instruksi]
                );
            }
        }
        console.log('✓ Medical records & prescriptions inserted.');

        console.log('\n======================================================');
        console.log('SEEDING COMPLETED SUCCESSFULLY!');
        console.log('======================================================');
        console.log('Login credentials for all users:');
        console.log('  Password (All Accounts): password123\n');
        console.log('  [Admin]');
        console.log('    • Username: admin');
        console.log('  [Doctors]');
        console.log('    • Username: budi   (Dr. Budi Santoso, Sp.PD)');
        console.log('    • Username: siti   (Dr. Siti Nurhaliza, Sp.A)');
        console.log('    • Username: hendra (Dr. Hendra Wijaya, Sp.JP)');
        console.log('  [Registrators]');
        console.log('    • Username: registrator1');
        console.log('    • Username: registrator2');
        console.log('======================================================\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
