-- ==============================================================================
-- Campus DAO — Complete Database Schema (PostgreSQL / Supabase)
-- Region context: Indian Institutional College Management System
-- Purpose: Off-chain application data, institutional identity verification,
--          and cross-referencing on-chain blockchain transaction hashes.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Pre-seeded Authorized College Roster (Institutional Source-of-Truth)
CREATE TABLE IF NOT EXISTS authorized_students (
    roll_no VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    institutional_email VARCHAR(150) UNIQUE NOT NULL,
    program VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Registered & Verified Students
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    roll_no VARCHAR(50) REFERENCES authorized_students(roll_no) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    institutional_email VARCHAR(150) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    wallet_address VARCHAR(42),
    wallet_authorized_at TIMESTAMP WITH TIME ZONE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'officer', 'treasurer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Clubs & Societies
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    banner_url TEXT,
    logo_url TEXT,
    created_by UUID REFERENCES students(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Club Memberships & Roles
CREATE TABLE IF NOT EXISTS club_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    role_in_club VARCHAR(50) DEFAULT 'Member' CHECK (role_in_club IN ('Member', 'Core Team', 'Treasurer', 'President', 'Faculty Advisor')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, student_id)
);

-- 5. Club Events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Record Sets (Batches of attendance or sensitive records)
CREATE TABLE IF NOT EXISTS record_sets (
    id VARCHAR(66) PRIMARY KEY, -- bytes32 hex string
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    on_chain_hash VARCHAR(66) NOT NULL, -- keccak256 hash committed on-chain
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    issued_by UUID REFERENCES students(id),
    tx_hash VARCHAR(66),
    verification_status VARCHAR(50) DEFAULT 'committed'
);

-- 7. Detailed Attendance Rows (Off-chain private data)
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_set_id VARCHAR(66) REFERENCES record_sets(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    roll_no VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'excused')),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Elections (Off-chain metadata referencing on-chain election_id)
CREATE TABLE IF NOT EXISTS elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    on_chain_election_id BIGINT UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Candidates
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    on_chain_candidate_id BIGINT NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    manifesto TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Proposals (Governance & Treasury)
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    proposer_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    proposal_type VARCHAR(20) DEFAULT 'governance' CHECK (proposal_type IN ('governance', 'treasury')),
    amount_inr NUMERIC(12, 2) DEFAULT 0.00,
    on_chain_proposal_id BIGINT UNIQUE,
    on_chain_hash VARCHAR(66) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'passed', 'rejected', 'executed')),
    tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Treasury Real-World Execution Tracker
CREATE TABLE IF NOT EXISTS treasury_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    payment_status VARCHAR(50) DEFAULT 'pending_governance_approval' CHECK (payment_status IN ('pending_governance_approval', 'approved_by_dao', 'processing_by_accounts_office', 'paid_via_bank_transfer', 'rejected')),
    payment_reference VARCHAR(100), -- College Bank / UPI UTR reference (real-world)
    vendor_name VARCHAR(150),
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE authorized_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_requests ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public clubs are viewable by everyone" ON clubs FOR SELECT USING (true);
CREATE POLICY "Public events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Public elections are viewable by everyone" ON elections FOR SELECT USING (true);
CREATE POLICY "Public candidates are viewable by everyone" ON candidates FOR SELECT USING (true);
CREATE POLICY "Public proposals are viewable by everyone" ON proposals FOR SELECT USING (true);
CREATE POLICY "Public record_sets are viewable by everyone" ON record_sets FOR SELECT USING (true);

-- Student Self-Management Policies
CREATE POLICY "Students can view other student profiles" ON students FOR SELECT USING (true);
CREATE POLICY "Students can update their own profile" ON students FOR UPDATE USING (auth.uid() = auth_uid);

-- ==============================================================================
-- Seed Realistic Data for College Academic Project
-- ==============================================================================
INSERT INTO authorized_students (roll_no, full_name, institutional_email, program, year) VALUES
('2023BCSE042', 'Aditi Sharma', 'aditi.sharma@college.edu.in', 'B.Tech Computer Science', 2),
('2023BCSE010', 'Rahul Verma', 'rahul.verma@college.edu.in', 'B.Tech Computer Science', 3),
('2023BCSE025', 'Priya Nair', 'priya.nair@college.edu.in', 'B.Tech Information Technology', 3),
('2023BME015', 'Karan Gupta', 'karan.gupta@college.edu.in', 'B.Tech Mechanical Engineering', 2),
('2023BEC031', 'Sneha Patel', 'sneha.patel@college.edu.in', 'B.Tech Electronics & Comm.', 4),
('2023BCSE099', 'Ronit Sen', 'ronit.sen@college.edu.in', 'B.Tech Computer Science', 1)
ON CONFLICT (roll_no) DO NOTHING;
