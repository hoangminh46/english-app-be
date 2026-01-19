# Changelog

## [2026-01-19]
### Added
- **Chat Assistant "Mine":**
    - New endpoint `/api/v1/chat/ask`.
    - Context-aware responses (Quiz, Grammar).
    - "Mine" persona: Friendly, uses "anh-em" honorifics.
    - Markdown formatting optimization for mobile (No tables).

### Changed
- **API Versioning:** All routes moved to `/api/v1`.
- **AI Service:**
    - Refactored `generateWithFallback` to support both JSON mode (Quiz/Scramble) and Markdown mode (Chat).
    - Restored backward compatibility for `max_tokens` (8192 for legacy, 2048 for Chat).
    - Restored backward compatibility for response structure (Raw content for legacy, Metadata for Chat).
- **Chat Service:**
    - Enforced strict "No Table" rule.
    - Forbidden backslash escaping in text.
    - Forbidden "bạn" pronoun.

### Fixed
- Fixed `ReferenceError: tag is not defined` in `aiService.js`.
- Fixed breaking changes in Quiz/Scramble API responses.
