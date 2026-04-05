-- RemoveEnrollmentIdUniqueConstraint
-- This migration removes the unique constraint from enrollment_id field in Student table

-- Drop the unique constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'Student_enrollment_id_key' 
        AND table_name = 'Student'
    ) THEN
        ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_enrollment_id_key";
    END IF;
END $$;

-- Re-add the constraint without unique requirement
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_enrollment_id_key" 
CHECK (char_length(enrollment_id, 1) >= 0 OR enrollment_id IS NULL);
