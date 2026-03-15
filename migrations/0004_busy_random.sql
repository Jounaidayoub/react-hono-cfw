ALTER TABLE `user` ADD `needs_onboarding` integer DEFAULT true;

UPDATE user
SET
    needs_onboarding = 0
WHERE
    EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE
            user_profiles.user_id = user.id
    );