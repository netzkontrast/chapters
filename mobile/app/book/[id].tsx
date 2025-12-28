/**
 * Book Screen (Profile)
 *
 * Displays a user's Book profile and their chapters.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetBook, useGetBookChapters } from '@/hooks/useBooks';
import { ChapterCard } from '@/components/library/ChapterCard';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { ChapterPreview } from '@/services/api/library';

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Fetch Book Details
  const {
    data: book,
    isLoading: isBookLoading,
    error: bookError
  } = useGetBook(id);

  // Fetch Book Chapters
  const {
    data: chaptersData,
    isLoading: isChaptersLoading,
    error: chaptersError
  } = useGetBookChapters(id);

  const isLoading = isBookLoading || isChaptersLoading;
  const error = bookError || chaptersError;

  const handleBack = () => {
    router.back();
  };

  const handleChapterPress = (chapterId: string) => {
    router.push(`/chapter/${chapterId}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.inkBlue} />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load Book</Text>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Map BookChapter to ChapterPreview for ChapterCard
  const chapters: ChapterPreview[] = chaptersData?.chapters.map(chapter => ({
    ...chapter,
    book_id: book.id,
    author_name: book.username,
    author_avatar: null, // Avatar not available in Book details
    margin_count: 0, // Margin count not available in BookChapter
    mood: chapter.mood || null,
    theme: chapter.theme || null,
    cover_url: chapter.cover_url || null,
  })) || [];

  const renderHeader = () => (
    <View style={styles.profileHeader}>
      <Text style={styles.username}>{book.username}</Text>
      {book.bio && <Text style={styles.bio}>{book.bio}</Text>}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{book.follower_count}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{book.following_count}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{book.chapter_count}</Text>
          <Text style={styles.statLabel}>Chapters</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <Pressable
          style={styles.navButton}
          onPress={handleBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.navButtonText}>←</Text>
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {book.username}'s Book
        </Text>
        <View style={styles.navButton} />
      </View>

      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChapterCard
            chapter={item}
            onPress={() => handleChapterPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chapters published yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.lg,
    color: colors.dustyCharcoal,
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.inkBlue,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.paperWhite,
    fontWeight: typography.weight.semibold,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.paperWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.warmGray,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: colors.inkBlue,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.inkBlue,
  },
  listContent: {
    padding: spacing.md,
  },
  profileHeader: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.warmGray,
  },
  username: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.inkBlue,
    marginBottom: spacing.sm,
  },
  bio: {
    fontSize: typography.size.md,
    color: colors.dustyCharcoal,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.inkBlue,
  },
  statLabel: {
    fontSize: typography.size.sm,
    color: colors.dustyCharcoal,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.warmGray,
    fontStyle: 'italic',
  },
});
