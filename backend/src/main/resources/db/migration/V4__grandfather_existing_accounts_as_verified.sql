-- These accounts predate the email-verification feature. Marking them verified
-- preserves access during the feature rollout; future registrations default to false.
UPDATE users
SET email_verified = TRUE
WHERE email_verified = FALSE;
