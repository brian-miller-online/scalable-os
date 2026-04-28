-- Allow 'not_set' as a valid status_color value.
-- The scorecard entry UI saves entries before a color is picked,
-- using 'not_set' as the initial sentinel value.

ALTER TABLE scorecard_entries
  DROP CONSTRAINT scorecard_entries_status_color_check;

ALTER TABLE scorecard_entries
  ADD CONSTRAINT scorecard_entries_status_color_check
  CHECK (status_color IN (
    'dark_green', 'lime_green', 'yellow', 'light_red', 'dark_red', 'not_set'
  ));
