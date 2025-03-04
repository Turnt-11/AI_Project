-- Function to get popular pages
CREATE OR REPLACE FUNCTION analytics.get_popular_pages()
RETURNS TABLE (
    page_path TEXT,
    view_count BIGINT,
    avg_time_spent FLOAT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        page_path,
        COUNT(*) as view_count,
        AVG(time_spent) as avg_time_spent
    FROM analytics.page_views
    GROUP BY page_path
    ORDER BY view_count DESC;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION analytics.get_popular_pages TO authenticated; 