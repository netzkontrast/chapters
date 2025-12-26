/**
 * Centralized Copy Constants for Chapters
 * 
 * Single source of truth for all user-facing text.
 * Maintains consistent "Book-world" language across the app.
 * 
 * Canon Vocabulary:
 * - Profile → Book
 * - Post → Chapter
 * - Home → Library
 * - Follow → Add to Shelf (Shelf)
 * - Draft area → Study
 * - Notes → Note Nook
 * - Settings → Preferences
 * - Account tab → Bindings
 * - Bio → Inside Flap
 * - Profile pic → Book Portrait
 * - Cover photo → Book Cover
 * - Publish → Open a Page
 * - DMs → Between the Lines
 * - People discovery → Spines
 * - Curated discovery → Quiet Picks
 * - Likes → Hearts
 * - Save → Bookmark
 */

export const COPY = {
  // Empty States
  EMPTY_STATES: {
    LIBRARY: {
      TITLE: "Nothing here yet.",
      BODY: "That's okay.\nBooks arrive after you read.",
      CTA: "Browse Quiet Picks",
    },
    SHELF: {
      TITLE: "Your Shelf is waiting.",
      BODY: "Add Books that feel like home.\nThe rest will follow.",
      CTA: "Browse Books & Spines",
    },
    QUIET_PICKS: {
      TITLE: "Quiet Picks appear over time.",
      BODY: "Chapters that lingered with readers, slowly.",
    },
    STUDY: {
      TITLE: "This is your Study.",
      BODY: "No one can see it.\nNothing needs to be finished.",
      CTA: "Start a Draft",
    },
    DRAFTS: {
      TITLE: "Every Book starts somewhere.",
      BODY: "A paragraph.\nA line.\nA thought you're not ready to name.",
      CTA: "Open a Draft",
    },
    NOTES: {
      TITLE: "Your Note Nook is quiet.",
      BODY: "Thoughts, fragments, things you want to remember.\nThey live here.",
    },
    BTL: {
      TITLE: "Nothing between the lines yet.",
      BODY: "Conversations begin when someone lingers.",
      CTA: "Keep Reading",
    },
    NEW_CHAPTERS: {
      TITLE: "No new chapters.",
      BODY: "Check back later for new chapters from Books on your Shelf.",
    },
    BOOKS_SPINES: {
      TITLE: "No Books yet.",
      BODY: "Books & Spines appear as people open their pages.",
    },
    CHAPTERS_PUBLIC: {
      TITLE: "Nothing public yet.",
      BODY: "Start with a chapter that lingers.",
    },
    THEMES: {
      TITLE: "No themes yet.",
      BODY: "Themes emerge as chapters are written.",
    },
  },

  // Loading States
  LOADING: {
    DEFAULT: "Loading...",
    SHELF: "Loading your Shelf...",
    CHAPTERS: "Finding chapters...",
    PICKS: "Finding your picks...",
    STUDY: "Loading your Study...",
    DRAFTS: "Loading drafts...",
    NOTES: "Loading notes...",
    BTL: "Loading conversations...",
    BOOKS_SPINES: "Loading Books & Spines...",
    THEMES: "Loading themes...",
  },

  // Quiet Picks
  QUIET_PICKS: {
    INFO_TITLE: "A Quiet Note",
    INFO_MESSAGE: "Quiet Picks are refreshed slowly. There's no rush — they'll be here when you're ready.",
  },

  // Tooltips
  TOOLTIPS: {
    MUSE_LIBRARY: "I can help you start writing, shape drafts, or find inspiration. Click anytime you need a creative companion.",
    MUSE_STUDY: "I'm here if you need a prompt, a title, or help shaping your thoughts. Just click when you're ready.",
  },

  // Buttons
  BUTTONS: {
    BROWSE_PICKS: "Browse Quiet Picks",
    BROWSE_BOOKS_SPINES: "Browse Books & Spines",
    START_DRAFT: "Start a Draft",
    OPEN_DRAFT: "Open a Draft",
    OPEN_PAGE: "Open a Page",
    KEEP_READING: "Keep Reading",
    BACK_TO_LIBRARY: "Back to Library",
    EXPLORE_LIBRARY: "Explore Library",
    START_YOUR_BOOK: "Start Your Book",
    CLOSE_BOOK: "Close the Book",
    DELETE_BOOK: "Delete Your Book",
  },

  // Navigation
  NAV: {
    LIBRARY: "Library",
    STUDY: "Study",
    BTL: "Conversations",
    PREFERENCES: "Preferences",
    MUSE: "Muse",
    LOGOUT: "Logout",
  },

  // Tabs
  TABS: {
    // Authenticated tabs
    SHELF: "Bookshelf",
    NEW_CHAPTERS: "New Chapters",
    QUIET_PICKS: "Quiet Picks",
    BOOKS_SPINES: "Books & Spines",
    THEMES: "Themes",
    // Public tabs
    CHAPTERS: "Chapters",
    // Study tabs
    DRAFTS: "Drafts",
    NOTE_NOOK: "Note Nook",
  },

  // Notifications
  NOTIFICATIONS: {
    TITLE: "Notifications",
    EMPTY: "No unread notifications",
    VIEW_ALL: "View All Notifications →",
    MARK_READ: "Mark read",
    MARK_ALL_READ: "Mark All Read",
    QUIET_MODE_ON: "🔕",
    QUIET_MODE_OFF: "🔔",
    UNREAD: "Unread",
    ALL: "All",
    TYPES: {
      MARGINS: "📝 Margins",
      SHELF: "📚 Shelf Adds",
      BTL: "💬 Conversations",
      BTL_INVITE: "💬 Conversation Invites",
    },
  },

  // Between the Lines
  BTL: {
    TITLE: "Between the Lines",
    PENDING_INVITES: "Pending Invitations",
    YOUR_CONVERSATIONS: "Your Conversations",
    ACCEPT: "Accept",
    DECLINE: "Decline",
    SEND_INVITATION: "Send an invitation from a Book page to start a conversation",
    CHAT_BUBBLE_TITLE: "Conversation Bubble",
    CHAT_BUBBLE_DESCRIPTION: "Show a floating bubble for quick access to your conversations",
  },

  // Study
  STUDY: {
    MOBILE_EDITING_TITLE: "Mobile Editing",
    MOBILE_EDITING_MESSAGE: "Editing is available on mobile. Use the web to view your drafts and notes.",
  },

  // Misc
  MISC: {
    UNREAD_COUNT: "unread",
    BLOCKS: "blocks",
    UPDATED: "Updated",
    STARTED: "Started",
    CLOSED: "Closed",
    GUEST_WELCOME_TITLE: "Welcome to the Library",
    GUEST_WELCOME_MESSAGE: "Sign in to add Books to your Shelf and get personalized picks",
  },

  // Preferences
  PREFERENCES: {
    DELETE_BOOK_TITLE: "Delete Your Book",
    DELETE_BOOK_MESSAGE: "This will permanently delete your Book, all chapters, drafts, notes, and conversations. This cannot be undone.",
    DELETE_BOOK_CONFIRM: "Delete Everything",
    DELETE_BOOK_CANCEL: "Keep My Book",
    DELETE_BOOK_WARNING: "Once your Book is deleted, it's gone. All chapters, drafts, notes, and conversations will be permanently removed.",
    BTL_SETTINGS_TITLE: "Conversation Settings",
    BTL_SETTINGS_DESCRIPTION: "Control how Between the Lines works for you.",
  },
} as const

// Type-safe access to copy
export type CopyKey = keyof typeof COPY
