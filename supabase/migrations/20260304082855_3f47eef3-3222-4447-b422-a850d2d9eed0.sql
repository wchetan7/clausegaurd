
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update clauses for their own contracts"
ON public.contract_clauses
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM contracts
  WHERE contracts.id = contract_clauses.contract_id
    AND contracts.user_id = auth.uid()
));
