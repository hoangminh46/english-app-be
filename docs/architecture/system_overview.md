# System Architecture Overview

## 1. Introduction
The English Learning App Backend is a Node.js/Express application designing to provide AI-powered English learning features. It leverages multiple AI providers (Groq, OpenRouter, Gemini) to generate personalized content like quizzes, puzzles, and interactive chat.

## 2. Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **AI Integration:**
    - **Groq:** Primary provider (High speed).
    - **OpenRouter:** Secondary fallback (High quality).
    - **Gemini:** Tertiary fallback (Reliability).
- **Authentication:** (TBD)

## 3. Core Modules
### 3.1. AI Service (`src/services/aiService.js`)
- **Responsibility:** Centralized handler for all AI API calls.
- **Key Features:**
    - **Fallback Mechanism:** Automatically switches providers on error/rate limit.
    - **Response Cleaning:** Parses JSON for Quiz/Scramble, sanitizes Markdown for Chat.
    - **Context Awareness:** Handles history and system prompts.

### 3.2. Quiz Service (`src/services/quizService.js`)
- **Responsibility:** Generates multiple-choice questions.
- **Features:** Custom Quiz, Quick Quiz.
- **Output:** Strict JSON format.

### 3.3. Scramble Service (`src/services/scrambleService.js`)
- **Responsibility:** Generates word scramble puzzles.
- **Output:** Strict JSON format.

### 3.4. Chat Service (`src/services/chatService.js`)
- **Responsibility:** Manages the "Mine" AI Assistant.
- **Features:**
    - **Persona:** "Mine" (Em gái nuôi - friendly, supportive).
    - **Context:** Aware of user's current activity (Quiz results, Grammar rules).
    - **Formatting:** Markdown optimized for mobile (No tables, strict headers).

## 4. API Structure
- Base URL: `/api/v1`
- Routes:
    - `/chat`: Chat functionalities.
    - `/quiz`: Quiz generation.
    - `/scramble`: Word scramble generation.
