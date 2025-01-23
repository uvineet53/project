-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create order_status enum type
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'shipped', 'delivered');
    END IF;
END $$;

-- Alter orders table to use the enum if not already using it
DO $$ BEGIN
    ALTER TABLE orders 
    ALTER COLUMN status TYPE order_status 
    USING status::order_status;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Create order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT fk_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO order_status_history (
        order_id,
        old_status,
        new_status
    ) VALUES (
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::text ELSE NULL END,
        NEW.status::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status changes
CREATE TRIGGER order_status_change_trigger
    AFTER INSERT OR UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- Function to update order status
CREATE OR REPLACE FUNCTION update_order_status(
    order_id UUID,
    new_status order_status
)
RETURNS orders AS $$
DECLARE
    updated_order orders;
    current_status order_status;
BEGIN
    -- Get current status
    SELECT status INTO current_status
    FROM orders
    WHERE id = order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- Validate status transition
    IF current_status = 'delivered' THEN
        RAISE EXCEPTION 'Cannot update status of delivered orders';
    END IF;

    IF current_status = 'pending' AND new_status = 'delivered' THEN
        RAISE EXCEPTION 'Order must be shipped before delivery';
    END IF;

    -- Update the order status
    UPDATE orders
    SET 
        status = new_status,
        updated_at = NOW()
    WHERE id = order_id
    RETURNING * INTO updated_order;

    RETURN updated_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order timeline
CREATE OR REPLACE FUNCTION get_order_timeline(p_order_id UUID)
RETURNS TABLE (
    status TEXT,
    created_at TIMESTAMPTZ,
    duration INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    WITH timeline AS (
        SELECT 
            new_status as status,
            created_at,
            LEAD(created_at) OVER (ORDER BY created_at) as next_status_time
        FROM order_status_history
        WHERE order_id = p_order_id
        ORDER BY created_at
    )
    SELECT 
        t.status,
        t.created_at,
        COALESCE(t.next_status_time - t.created_at, NOW() - t.created_at) as duration
    FROM timeline t;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on the new table
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own order status history" ON order_status_history;
DROP POLICY IF EXISTS "Admins can view all order status history" ON order_status_history;
DROP POLICY IF EXISTS "Admins can update order status" ON orders;

-- Create new policies
CREATE POLICY "Users can view their own order status history"
    ON order_status_history
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_status_history.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order status history"
    ON order_status_history
    FOR SELECT
    TO admin
    USING (true);

CREATE POLICY "Admins can update order status"
    ON orders
    FOR UPDATE
    TO admin
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON TYPE order_status TO authenticated;
GRANT USAGE ON TYPE order_status TO anon;
GRANT EXECUTE ON FUNCTION update_order_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_timeline TO authenticated; 