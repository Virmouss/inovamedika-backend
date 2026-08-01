CREATE TABLE IF NOT EXISTS USERS (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Admin', 'Doctor', 'Registrator')) NOT NULL,
    doctor_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS PATIENTS (
    id SERIAL PRIMARY KEY,
    nik VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    kelamin VARCHAR(20) CHECK (kelamin IN ('Laki-laki', 'Perempuan')) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    nomor_telepon VARCHAR(20),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS DOCTORS (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    spesialis VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS MEDICAL_RECORDS (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES PATIENTS(id),
    doctor_id INT NOT NULL REFERENCES DOCTORS(id),
    visit_date TIMESTAMP NOT NULL,
    keluhan_awal TEXT,
    tekanan_darah VARCHAR(20),
    suhu_tubuh DECIMAL(5,2),
    berat_badan DECIMAL(5,2),
    diagnosa TEXT,
    rencana_terapi TEXT,
    tindakan_medis TEXT,
    resep_obat TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS APPOINTMENTS (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES PATIENTS(id),
    doctor_id INT NOT NULL REFERENCES DOCTORS(id),
    parent_medical_record_id INT NULL REFERENCES MEDICAL_RECORDS(id),
    poli VARCHAR(50),
    keluhan_awal TEXT,
    jenis_pembayaran VARCHAR(50),
    queue_number VARCHAR(10) NULL,
    status_kunjungan VARCHAR(20) CHECK (status_kunjungan IN ('waiting', 'called', 'assessing', 'done', 'cancelled')) DEFAULT 'waiting',
    jadwal_kunjungan TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user (password: admin123)
-- We use DO INSTEAD to mimic INSERT IGNORE or handle conflict in PostgreSQL
INSERT INTO USERS (username, password, role)
VALUES ('admin', '$2b$10$71qEMr8IeqKyiv27wZWxJed6nTjGxdi45jkI3QFU7cXql5LhRvQ36', 'Admin')
ON CONFLICT (username) DO NOTHING;
