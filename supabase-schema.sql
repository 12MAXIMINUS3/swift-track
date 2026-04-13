-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Shipments Table
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_code TEXT UNIQUE NOT NULL,
    
    -- Sender Info
    sender_name TEXT,
    sender_address TEXT,
    sender_phone TEXT,
    
    -- Receiver Info
    receiver_name TEXT,
    receiver_address TEXT,
    receiver_phone TEXT,
    receiver_email TEXT,
    
    -- Shipment Details
    origin TEXT,
    destination TEXT,
    current_location TEXT,
    status TEXT DEFAULT 'pending', -- pending, picked_up, in_transit, out_for_delivery, delivered, on_hold, returned
    package_type TEXT,
    weight TEXT,
    dimensions TEXT,
    shipping_method TEXT,
    estimated_delivery DATE,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Shipment History Table
CREATE TABLE IF NOT EXISTS public.shipment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON public.shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_history ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (so anyone with a tracking code can see their shipment)
CREATE POLICY "Allow public read access to shipments"
    ON public.shipments
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Allow public read access to shipment history"
    ON public.shipment_history
    FOR SELECT TO public
    USING (true);

-- Allow authenticated admins full access
CREATE POLICY "Allow authenticated full access to shipments"
    ON public.shipments
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to shipment history"
    ON public.shipment_history
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_code ON public.shipments(tracking_code);
CREATE INDEX IF NOT EXISTS idx_shipment_history_shipment_id ON public.shipment_history(shipment_id);
