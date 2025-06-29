export enum ErrorMessages {
    AppStartupFail = 'Unable to start the app!',
    CreateFail = 'Unable to save entry to DB!',
    GetFail = 'Unable to retrieve data from DB!',
    UpdateFail = 'Unable to update data in DB!',
    DeleteFail = 'Unable to delete entry from DB!',
    DuplicateEntryFail = 'User already exists!',
    PasswordMismatchFail = 'Passwords must match!',
    Generic = 'Something went wrong!',
    NotFound = 'Unable to find the requested resource!',
    UncaughtException = 'Uncaught Exception thrown!',
    UnhandledRejection = 'Unhandled Exception thrown!',
    
    // Playlist specific errors
    PLAYLIST_NOT_FOUND = 'Playlist not found!',
    PLAYLIST_ACCESS_DENIED = 'You do not have access to this playlist!',
    PLAYLIST_EDIT_DENIED = 'You do not have permission to edit this playlist!',
    PLAYLIST_DELETE_DENIED = 'You do not have permission to delete this playlist!',
    PLAYLIST_SHARE_DENIED = 'You do not have permission to share this playlist!',
    PLAYLIST_UNSHARE_DENIED = 'You do not have permission to unshare this playlist!',
    PLAYLIST_CREATION_FAILED = 'Failed to create playlist!',
    PLAYLIST_UPDATE_FAILED = 'Failed to update playlist!',
    PLAYLIST_SHARE_FAILED = 'Failed to share playlist!',
    PLAYLIST_UNSHARE_FAILED = 'Failed to unshare playlist!',
    PLAYLIST_REORDER_FAILED = 'Failed to reorder songs in playlist!',
    SONG_ADD_FAILED = 'Failed to add song to playlist!',
    SONG_REMOVE_FAILED = 'Failed to remove song from playlist!'
  }