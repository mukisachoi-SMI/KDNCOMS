# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-13

### 🎉 Phase 1 - Foundation Release

#### Added
- **Authentication System**
  - Church-specific login system
  - Session management with 30-minute auto-logout
  - Secure password handling

- **Member Management**
  - CRUD operations for church members
  - Position management (Pastor, Elder, Deacon, etc.)
  - Position status management (Active, Retired, Associate, etc.)
  - Advanced search and filtering
  - Member detail view with donation history

- **Donation Management**
  - Donation registration for members and non-members
  - Multiple donation types support
  - Quick donation entry feature
  - Donation history tracking
  - Edit and delete capabilities

- **Reports & Analytics**
  - Real-time dashboard with statistics
  - Monthly/Yearly donation reports
  - Donation type analysis
  - Member-specific donation reports
  - Data visualization with charts

- **Church Settings**
  - Church information management
  - Custom donation types
  - Custom positions and statuses
  - Contact information management

- **Church Logo System** (Latest Feature)
  - Logo upload with automatic resizing (200x200px)
  - Support for JPG, PNG, WebP formats
  - Logo preview on login screen
  - Logo display throughout the system
  - File size limit: 500KB

- **PWA (Progressive Web App) Support** ✅
  - Full offline capability
  - Install as native app (Android/iOS/Desktop)
  - Service Worker with caching
  - App icons (16x16 to 512x512)
  - Dark mode support
  - Splash screen
  - App shortcuts
  - iOS and Android optimization

- **UI/UX Features**
  - Fully responsive design (Mobile, Tablet, Desktop)
  - Intuitive navigation
  - Real-time feedback
  - Modern, clean interface

#### Technical Implementation
- React 18 with TypeScript
- Tailwind CSS for styling
- Supabase for backend (PostgreSQL)
- Supabase Storage for file uploads
- Component-based architecture
- Type-safe development

#### Database Schema
- Churches table with multi-tenant support
- Members table with position relationships
- Donations table with comprehensive tracking
- Donation types customization
- Position and status management
- ID sequence management for unique identifiers

#### Security Features
- Data isolation between churches
- Session-based authentication
- Secure password storage
- RLS policies for storage

### Known Issues
- Large data export may cause high memory usage
- Some animations may lag on Safari browser

### Test Churches
- 서울교회 (ID: seoulch, PW: seoul2025!)
- 가나안 한인교회 (ID: kanaanch, PW: kanaan2025!)
- 시드니 갈릴리교회 (ID: galileech, PW: galilee2025!)

---

## [0.9.0] - 2025-01-10 (Pre-release)

### Added
- Initial member management system
- Basic donation tracking
- Simple reporting features

## [0.5.0] - 2025-01-05 (Alpha)

### Added
- Project setup and configuration
- Database schema design
- Basic authentication flow

---

## Upcoming - Phase 2 (Planned)

### Planned Features
- [ ] Email notifications for donations
- [ ] PDF export for reports
- [ ] Yearly tax receipts generation
- [ ] Multiple user roles per church
- [ ] Donation pledge tracking
- [ ] Event management
- [ ] SMS integration (Twilio)
- [ ] Backup and restore functionality
- [ ] Multi-language support (Korean/English)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

---

## Version History

| Version | Phase | Date | Status |
|---------|-------|------|--------|
| 1.0.0 | Phase 1 - Foundation | 2025-01-13 | ✅ Released |
| 1.1.0 | Phase 2 - Enhancement | 2025-02-01 | 🚧 Planning |
| 1.2.0 | Phase 2 - Features | 2025-03-01 | 📋 Planned |
| 2.0.0 | Phase 3 - Platform | 2025-Q2 | 💭 Concept |
