-- Migration 003: Blockchain Transactions
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    transaction_hash VARCHAR(66) NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    block_timestamp TIMESTAMPTZ NOT NULL,
    network_name VARCHAR(100) NOT NULL,
    chain_id BIGINT NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    submitter_address VARCHAR(42) NOT NULL,
    gas_used BIGINT,
    effective_gas_price VARCHAR(78),
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blockchain_tx_hash ON blockchain_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_doc_id ON blockchain_transactions(document_id);

