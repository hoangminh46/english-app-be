# API Documentation

## Base URL
`/api/v1`

## 1. Chat
### POST /chat/ask
- **Description:** Send a message to the AI Assistant "Mine".
- **Body:**
  ```json
  {
    "message": "User's message",
    "context": { "type": "quiz", "data": {...} }, // Optional
    "history": [ { "role": "user", "content": "..." } ] // Optional
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "answer": "AI response in Markdown",
      "tokens_used": 150,
      "session_id": "uuid"
    },
    "error": null
  }
  ```

## 2. Quiz
### POST /quiz/generate
- **Description:** Generate a custom quiz based on parameters.
- **Body:**
  ```json
  {
    "quantity": 10,
    "difficulty": "Intermediate",
    "topic": "Travel"
    // ...other params
  }
  ```
- **Response:** JSON object containing the list of questions.

### POST /quiz/quick
- **Description:** Generate a quick 10-question quiz with random topics.
- **Body:** `{}`
- **Response:** JSON object containing the list of questions.

## 3. Scramble
### POST /scramble/generate
- **Description:** Generate word scramble puzzles.
- **Body:**
  ```json
  {
    "quantity": 5,
    "difficulty": "Easy",
    "topics": ["Animals"]
  }
  ```
- **Response:** JSON object containing the list of words.
