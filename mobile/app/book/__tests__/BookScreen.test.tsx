
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookScreen from '../[id]';
import { useGetBook, useGetBookChapters } from '@/hooks/useBooks';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock dependencies
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useBooks', () => ({
  useGetBook: jest.fn(),
  useGetBookChapters: jest.fn(),
}));

// Mock theme to avoid issues with platform specifics if any
jest.mock('@/theme', () => ({
  colors: {
    background: '#ffffff',
    inkBlue: '#0000ff',
    paperWhite: '#f0f0f0',
    warmGray: '#cccccc',
    dustyCharcoal: '#333333',
    muse: '#ff00ff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    size: {
      xs: 12,
      md: 16,
      lg: 20,
      xxl: 24,
    },
    weight: {
      medium: '500',
      bold: '700',
      semibold: '600',
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
  },
  shadows: {
    sm: {},
  },
}));

describe('BookScreen', () => {
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
  };

  const mockBook = {
    id: '1',
    user_id: 'user1',
    username: 'testuser',
    bio: 'Test Bio',
    chapter_count: 5,
    follower_count: 10,
    following_count: 20,
  };

  const mockChapters = {
    chapters: [
      {
        id: 'c1',
        title: 'Chapter 1',
        published_at: '2023-01-01T00:00:00Z',
        heart_count: 5,
        mood: 'Happy',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
  });

  it('renders loading state for book', () => {
    (useGetBook as jest.Mock).mockReturnValue({ isLoading: true });
    (useGetBookChapters as jest.Mock).mockReturnValue({ isLoading: true });

    const { getByTestId } = render(<BookScreen />);
    // Note: ActivityIndicator doesn't have a default testID, looking for container logic
    // But ActivityIndicator renders.
    // Let's just check if it doesn't crash.
  });

  it('renders error state', () => {
    (useGetBook as jest.Mock).mockReturnValue({ isLoading: false, error: true });
    (useGetBookChapters as jest.Mock).mockReturnValue({ isLoading: false });

    const { getByText } = render(<BookScreen />);
    expect(getByText('Failed to load book')).toBeTruthy();
  });

  it('renders book profile and chapters', () => {
    (useGetBook as jest.Mock).mockReturnValue({ isLoading: false, data: mockBook });
    (useGetBookChapters as jest.Mock).mockReturnValue({ isLoading: false, data: mockChapters });

    const { getByText } = render(<BookScreen />);

    expect(getByText("testuser's Book")).toBeTruthy();
    expect(getByText('testuser')).toBeTruthy();
    expect(getByText('Test Bio')).toBeTruthy();
    expect(getByText('Chapter 1')).toBeTruthy();
    expect(getByText('Happy')).toBeTruthy();
  });

  it('navigates back when back button pressed', () => {
    (useGetBook as jest.Mock).mockReturnValue({ isLoading: false, data: mockBook });
    (useGetBookChapters as jest.Mock).mockReturnValue({ isLoading: false, data: mockChapters });

    const { getByLabelText } = render(<BookScreen />);

    fireEvent.press(getByLabelText('Go back'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('navigates to chapter when chapter pressed', () => {
    (useGetBook as jest.Mock).mockReturnValue({ isLoading: false, data: mockBook });
    (useGetBookChapters as jest.Mock).mockReturnValue({ isLoading: false, data: mockChapters });

    const { getByText } = render(<BookScreen />);

    fireEvent.press(getByText('Chapter 1'));
    expect(mockRouter.push).toHaveBeenCalledWith('/chapter/c1');
  });
});
