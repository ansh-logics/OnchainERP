-- Migration to add Assignment module fields
-- Run this to update existing Assignment and AssignmentSubmission tables

-- Add submissionFormat field to assignments table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' AND column_name = 'submissionFormat'
    ) THEN
        ALTER TABLE assignments ADD COLUMN submissionFormat VARCHAR(255) DEFAULT 'pdf';
    END IF;
END $$;

-- Add fileUrls field to assignment_submissions table if it doesn't exist  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignment_submissions' AND column_name = 'fileUrls'
    ) THEN
        ALTER TABLE assignment_submissions ADD COLUMN fileUrls JSON;
    END IF;
END $$;

-- Update existing assignments to have default submission format
UPDATE assignments SET submissionFormat = 'pdf' WHERE submissionFormat IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_submission_format ON assignments(submissionFormat);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_file_urls ON assignment_submissions USING GIN (fileUrls);

-- Update any existing assignment submission statuses if needed
UPDATE assignment_submissions 
SET status = 'submitted' 
WHERE status IS NULL;

COMMIT;
