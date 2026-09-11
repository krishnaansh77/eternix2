CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(16) NOT NULL CHECK (role IN ('DOCTOR', 'PATIENT')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ
);

CREATE UNIQUE INDEX users_email_lower_unique ON users (LOWER(email));

CREATE TABLE patients (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(32),
    phone VARCHAR(40),
    address TEXT,
    profile_image_url TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    specialization VARCHAR(160),
    license_identifier VARCHAR(160),
    organization VARCHAR(200),
    phone VARCHAR(40),
    profile_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctor_patients (
    id UUID PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    status VARCHAR(16) NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctor_patients_doctor_patient_unique UNIQUE (doctor_id, patient_id)
);

CREATE INDEX doctor_patients_doctor_status_idx ON doctor_patients (doctor_id, status);
CREATE INDEX doctor_patients_patient_status_idx ON doctor_patients (patient_id, status);

CREATE TABLE patient_reports (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    report_type VARCHAR(32) NOT NULL CHECK (report_type IN ('CBC', 'PNEUMOTHORAX', 'ECG', 'MRI', 'OTHER')),
    upload_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_path TEXT NOT NULL,
    original_file_name VARCHAR(500) NOT NULL,
    prediction_result JSONB,
    doctor_correction TEXT,
    status VARCHAR(16) NOT NULL CHECK (status IN ('PENDING', 'PREDICTED', 'CONFIRMED', 'CORRECTED')),
    reviewed_by_doctor_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX patient_reports_patient_uploaded_idx ON patient_reports (patient_id, upload_date DESC);
CREATE INDEX patient_reports_type_uploaded_idx ON patient_reports (report_type, upload_date DESC);

CREATE TABLE cbc_reports (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 130),
    height NUMERIC(8, 2) NOT NULL CHECK (height > 0),
    weight NUMERIC(8, 2) NOT NULL CHECK (weight > 0),
    bmi NUMERIC(8, 2) NOT NULL CHECK (bmi > 0),
    hb NUMERIC(10, 4),
    rbc NUMERIC(10, 4),
    wbc NUMERIC(10, 4),
    platelets NUMERIC(10, 4),
    neutrophils NUMERIC(10, 4),
    lymphocytes NUMERIC(10, 4),
    monocytes NUMERIC(10, 4),
    eosinophils NUMERIC(10, 4),
    basophils NUMERIC(10, 4),
    mcv NUMERIC(10, 4),
    mch NUMERIC(10, 4),
    mchc NUMERIC(10, 4),
    rdw NUMERIC(10, 4),
    source VARCHAR(64) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX cbc_reports_patient_created_idx ON cbc_reports (patient_id, created_at DESC);
CREATE INDEX cbc_reports_submitted_by_created_idx ON cbc_reports (submitted_by, created_at DESC);

CREATE TABLE cbc_predictions (
    id UUID PRIMARY KEY,
    cbc_report_id UUID NOT NULL UNIQUE REFERENCES cbc_reports(id) ON DELETE CASCADE,
    predicted_class VARCHAR(200) NOT NULL,
    confidence NUMERIC(8, 6),
    severity VARCHAR(64),
    probabilities_json JSONB,
    contributing_features_json JSONB,
    model_version VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX cbc_predictions_created_idx ON cbc_predictions (created_at DESC);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX audit_logs_actor_created_idx ON audit_logs (actor_user_id, created_at DESC);
CREATE INDEX audit_logs_entity_idx ON audit_logs (entity_type, entity_id);
