
-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  vendor TEXT NOT NULL,
  file_url TEXT,
  contract_value NUMERIC DEFAULT 0,
  risk_score TEXT DEFAULT 'Low' CHECK (risk_score IN ('Low', 'Medium', 'High')),
  status TEXT DEFAULT 'Scanning' CHECK (status IN ('Scanning', 'Reviewed', 'Action Required', 'Archived')),
  renewal_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own contracts"
ON public.contracts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contracts"
ON public.contracts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts"
ON public.contracts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts"
ON public.contracts FOR DELETE
USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
