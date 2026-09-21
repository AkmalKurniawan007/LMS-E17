-- Create helpdesk_tickets table
CREATE TABLE public.helpdesk_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('Open', 'In Progress', 'Resolved')) DEFAULT 'Open' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create helpdesk_messages table
CREATE TABLE public.helpdesk_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.helpdesk_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) for helpdesk_tickets
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets" ON public.helpdesk_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON public.helpdesk_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" ON public.helpdesk_tickets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to tickets" ON public.helpdesk_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'Super Admin'
        )
    );

-- Set up Row Level Security (RLS) for helpdesk_messages
ALTER TABLE public.helpdesk_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their tickets" ON public.helpdesk_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.helpdesk_tickets
            WHERE helpdesk_tickets.id = ticket_id AND helpdesk_tickets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages for their tickets" ON public.helpdesk_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.helpdesk_tickets
            WHERE helpdesk_tickets.id = ticket_id AND helpdesk_tickets.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins have full access to messages" ON public.helpdesk_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'Super Admin'
        )
    );
