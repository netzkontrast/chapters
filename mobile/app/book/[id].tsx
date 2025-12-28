/**
 * Book Profile Screen
 *
 * Displays a user's Book profile and their published chapters
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetBook, useGetBookChapters } from '@/hooks/useBooks';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';

export default function BookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: book, isLoading: bookLoading, error: bookError } = useGetBook(id);
  const { data: chaptersData, isLoading: chaptersLoading } = useGetBookChapters(id);

  const handleBack = () => {
    router.back();
  };

  const handleChapterPress = (chapterId: string) => {
    router.push(`/chapter/${chapterId}`);
  };

  if (bookLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.inkBlue} />
      </View>
    );
  }

  if (bookError || !book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load book</Text>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={handleBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.headerButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.username}'s Book
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Text style={styles.username}>{book.username}</Text>
          {book.bio && <Text style={styles.bio}>{book.bio}</Text>}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{book.chapter_count}</Text>
              <Text style={styles.statLabel}>Chapters</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{book.follower_count}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{book.following_count}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Chapters Section */}
        <View style={styles.chaptersSection}>
          <Text style={styles.sectionTitle}>Published Chapters</Text>

          {chaptersLoading ? (
            <ActivityIndicator size="small" color={colors.inkBlue} style={styles.loadingChapters} />
          ) : chaptersData?.chapters.length === 0 ? (
            <Text style={styles.emptyText}>No chapters published yet</Text>
          ) : (
            chaptersData?.chapters.map((chapter) => (
              <Pressable
                key={chapter.id}
                style={styles.chapterCard}
                onPress={() => handleChapterPress(chapter.id)}
              >
                <View style={styles.chapterInfo}>
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                  <View style={styles.chapterMeta}>
                    <Text style={styles.chapterDate}>
                      {new Date(chapter.published_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    {(chapter.mood || chapter.theme) && (
                      <>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.chapterTag}>
                          {[chapter.mood, chapter.theme].filter(Boolean).join(', ')}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.heartContainer}>
                  <Text style={styles.heartIcon}>❤️</Text>
                  <Text style={styles.heartCount}>{chapter.heart_count}</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
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
    borderRadius: borderRadius.sm,
  },
  backButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.paperWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.paperWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.warmGray,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 24,
    color: colors.inkBlue,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.inkBlue,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  profileSection: {
    padding: spacing.xl,
    backgroundColor: colors.paperWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.warmGray,
    alignItems: 'center',
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
    paddingHorizontal: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.inkBlue,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.warmGray,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.warmGray,
  },
  chaptersSection: {
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.inkBlue,
    marginBottom: spacing.md,
  },
  loadingChapters: {
    marginTop: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.warmGray,
    fontStyle: 'italic',
    marginTop: spacing.lg,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paperWhite,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  chapterInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  chapterTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.inkBlue,
    marginBottom: 4,
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterDate: {
    fontSize: typography.size.xs,
    color: colors.warmGray,
  },
  metaDot: {
    fontSize: typography.size.xs,
    color: colors.warmGray,
    marginHorizontal: 4,
  },
  chapterTag: {
    fontSize: typography.size.xs,
    color: colors.muse,
    fontStyle: 'italic',
  },
  heartContainer: {
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  heartCount: {
    fontSize: typography.size.xs,
    color: colors.dustyCharcoal,
  },
});
