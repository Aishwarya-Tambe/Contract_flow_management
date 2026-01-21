/*
  # Contract Management Platform Schema

  ## Overview
  This migration sets up the complete database schema for a Contract Flow Management system
  with blueprints (templates), contracts, and field management.

  ## New Tables

  ### 1. `blueprints`
  Stores reusable contract templates
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Blueprint name
  - `description` (text, nullable) - Optional description
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `blueprint_fields`
  Stores configurable fields for each blueprint
  - `id` (uuid, primary key) - Unique identifier
  - `blueprint_id` (uuid, foreign key) - References blueprints table
  - `field_type` (text) - Field type: 'text', 'date', 'signature', 'checkbox'
  - `label` (text) - Field label/name
  - `position_x` (integer) - X coordinate for field positioning
  - `position_y` (integer) - Y coordinate for field positioning
  - `width` (integer) - Field width
  - `height` (integer) - Field height
  - `required` (boolean) - Whether field is required
  - `placeholder` (text, nullable) - Optional placeholder text
  - `order_index` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `contracts`
  Stores contract instances created from blueprints
  - `id` (uuid, primary key) - Unique identifier
  - `blueprint_id` (uuid, foreign key) - References blueprints table
  - `name` (text) - Contract name
  - `status` (text) - Lifecycle status: 'created', 'approved', 'sent', 'signed', 'locked', 'revoked'
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `approved_at` (timestamptz, nullable) - Approval timestamp
  - `sent_at` (timestamptz, nullable) - Sent timestamp
  - `signed_at` (timestamptz, nullable) - Signature timestamp
  - `locked_at` (timestamptz, nullable) - Lock timestamp
  - `revoked_at` (timestamptz, nullable) - Revocation timestamp

  ### 4. `contract_field_values`
  Stores filled values for contract fields
  - `id` (uuid, primary key) - Unique identifier
  - `contract_id` (uuid, foreign key) - References contracts table
  - `blueprint_field_id` (uuid, foreign key) - References blueprint_fields table
  - `value` (text) - Field value (stored as text, interpreted based on field type)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for public access (since this is a demo application)
  
  ## Indexes
  - Add indexes for foreign keys and frequently queried columns
*/

-- Create blueprints table
CREATE TABLE IF NOT EXISTS blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blueprint_fields table
CREATE TABLE IF NOT EXISTS blueprint_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id uuid NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
  field_type text NOT NULL CHECK (field_type IN ('text', 'date', 'signature', 'checkbox')),
  label text NOT NULL,
  position_x integer DEFAULT 0,
  position_y integer DEFAULT 0,
  width integer DEFAULT 200,
  height integer DEFAULT 40,
  required boolean DEFAULT false,
  placeholder text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id uuid NOT NULL REFERENCES blueprints(id) ON DELETE RESTRICT,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'approved', 'sent', 'signed', 'locked', 'revoked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  sent_at timestamptz,
  signed_at timestamptz,
  locked_at timestamptz,
  revoked_at timestamptz
);

-- Create contract_field_values table
CREATE TABLE IF NOT EXISTS contract_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  blueprint_field_id uuid NOT NULL REFERENCES blueprint_fields(id) ON DELETE RESTRICT,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(contract_id, blueprint_field_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blueprint_fields_blueprint_id ON blueprint_fields(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_contracts_blueprint_id ON contracts(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contract_field_values_contract_id ON contract_field_values(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_field_values_blueprint_field_id ON contract_field_values(blueprint_field_id);

-- Enable Row Level Security
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_field_values ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo application)
CREATE POLICY "Public read access for blueprints"
  ON blueprints FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access for blueprints"
  ON blueprints FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access for blueprints"
  ON blueprints FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for blueprints"
  ON blueprints FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public read access for blueprint_fields"
  ON blueprint_fields FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access for blueprint_fields"
  ON blueprint_fields FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access for blueprint_fields"
  ON blueprint_fields FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for blueprint_fields"
  ON blueprint_fields FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public read access for contracts"
  ON contracts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access for contracts"
  ON contracts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access for contracts"
  ON contracts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for contracts"
  ON contracts FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public read access for contract_field_values"
  ON contract_field_values FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public insert access for contract_field_values"
  ON contract_field_values FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public update access for contract_field_values"
  ON contract_field_values FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access for contract_field_values"
  ON contract_field_values FOR DELETE
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_blueprints_updated_at
  BEFORE UPDATE ON blueprints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_field_values_updated_at
  BEFORE UPDATE ON contract_field_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();