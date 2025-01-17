# Backend Changelog

## 17.01.2025

### Added
- Implemented messaging server with GraphQL API
  - Users can view their conversations and messages
  - Users can search for other mock users and start new conversations
  - Users can send messages to other mock users in a conversation
  - Real-time updates for new messages and conversation updates using GraphQL subscriptions
  - Integrated with MongoDB for storing conversation and message data
- Added new environment variable `INTERNAL_MESSAGING_SERVER_URL=http://messagingserver:3000` for the messaging server URL

### Changed
- Refactored the codebase to support the new messaging functionality
- Improved error handling and logging across the backend services

### Fixed
- Various bug fixes and performance improvements

### Known Issues
- Messaging functionality is currently using mock user data, need to integrate with real user accounts
- Notification server is not yet integrated with the messaging server

### TODO
- Integrate messaging server with real user accounts
- Integrate messaging server with the notification server to handle notifications