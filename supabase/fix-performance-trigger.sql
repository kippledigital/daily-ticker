-- Fix stock_performance trigger to use correct column name
-- The table has 'last_updated' but the trigger tries to set 'updated_at'

-- Drop the existing trigger
DROP TRIGGER IF EXISTS update_stock_performance_updated_at ON stock_performance;

-- Create new trigger function that uses the correct column name
CREATE OR REPLACE FUNCTION update_stock_performance_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger using the new function
CREATE TRIGGER update_stock_performance_last_updated
  BEFORE UPDATE ON stock_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_performance_last_updated();

COMMENT ON FUNCTION update_stock_performance_last_updated() IS 'Updates last_updated timestamp whenever stock_performance record is updated';
