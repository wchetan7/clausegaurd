
-- Create contract_clauses table
CREATE TABLE public.contract_clauses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  clause_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'LOW',
  summary TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  action_required TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_clauses ENABLE ROW LEVEL SECURITY;

-- Users can view clauses for their own contracts
CREATE POLICY "Users can view their own contract clauses"
ON public.contract_clauses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contracts WHERE contracts.id = contract_clauses.contract_id AND contracts.user_id = auth.uid()
  )
);

-- Users can insert clauses for their own contracts
CREATE POLICY "Users can insert clauses for their own contracts"
ON public.contract_clauses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contracts WHERE contracts.id = contract_clauses.contract_id AND contracts.user_id = auth.uid()
  )
);

-- Users can delete clauses for their own contracts
CREATE POLICY "Users can delete their own contract clauses"
ON public.contract_clauses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.contracts WHERE contracts.id = contract_clauses.contract_id AND contracts.user_id = auth.uid()
  )
);

-- Add notice_period_days and auto_renewal to contracts table
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS notice_period_days INTEGER,
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT false;
