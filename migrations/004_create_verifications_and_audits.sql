-- Migration 004: Verification Records and Audit Logs
CREATE TABLE IF NOT EXISTS verification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_filename VARCHAR(255),
    calculated_hash VARCHAR(64) NOT NULL,
    verification_status VARCHAR(50) NOT NULL CHECK (verification_status IN ('AUTHENTIC', 'TAMPERED', 'NOT_REGISTERED')),
    matched_on_chain BOOLEAN NOT NULL DEFAULT false,
    document_reference_claimed VARCHAR(100),
    blockchain_timestamp TIMESTAMPTZ,
    ip_address VARCHAR(64),
    user_agent TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(64),
    user_agent TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_hash ON verification_records(calculated_hash);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verification_records(verification_status);
CREATE INDEX IF NOT EXISTS idx_verifications_doc_id ON verification_records(document_id);
CREATE INDEX IF NOT EXISTS idx_verifications_created_at ON verification_records(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

