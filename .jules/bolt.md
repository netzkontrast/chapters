## 2025-12-28 - [Backend Performance: Composite Index on Notifications]
**Learning:** Adding a composite index on `(user_id, created_at)` allows the database to fetch pre-sorted notifications for a user without performing an expensive sort operation at runtime. This changes the query complexity from O(N log N) to O(log N) or O(1) for top-k results.
**Action:** When optimizing list endpoints that filter by a parent ID and sort by time (like comments, feed items, notifications), always consider a composite index on `(parent_id, sort_column)`.
