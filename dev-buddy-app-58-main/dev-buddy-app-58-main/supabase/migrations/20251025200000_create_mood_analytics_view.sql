-- Create a view for mood analytics
CREATE OR REPLACE VIEW mood_analytics AS
SELECT 
  user_id,
  DATE(created_at) as entry_date,
  COUNT(*) as entry_count,
  AVG(mood_intensity) as avg_intensity,
  MODE() WITHIN GROUP (ORDER BY mood_category) as dominant_mood_category,
  STRING_AGG(mood_label, ', ') as mood_labels
FROM mood_entries
GROUP BY user_id, DATE(created_at)
ORDER BY entry_date DESC;

-- Grant access to the view
GRANT SELECT ON mood_analytics TO authenticated;