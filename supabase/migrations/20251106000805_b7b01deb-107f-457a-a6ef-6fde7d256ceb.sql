-- Adicionar coluna categoria às despesas financeiras
ALTER TABLE financial_records 
ADD COLUMN IF NOT EXISTS categoria TEXT;

-- Adicionar índice para melhorar performance nas queries
CREATE INDEX IF NOT EXISTS idx_financial_records_tipo ON financial_records(tipo);
CREATE INDEX IF NOT EXISTS idx_financial_records_data ON financial_records(data_registro);
CREATE INDEX IF NOT EXISTS idx_financial_records_categoria ON financial_records(categoria);