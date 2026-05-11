
# Social-Media-Demo

# 🚀 Live Demo(Contact for RLS whitelist)

https://rythreads.vercel.app

Social Media threads-style demo for portfolio
=======
# 🐦 Social Media App (React + Supabase + WebLLM)

A full-stack social media platform built with React, Supabase, and an in-browser LLM (WebLLM).  
Users can sign up, log in, create posts, like posts, reply in threads, and generate AI-powered summaries of posts — all in a Reddit-style feed system.

---

## 🚀 Live Demo



---

## ✨ Features

### 🔐 Authentication
- Email/password sign up & login (Supabase Auth)
- Google OAuth login (optional)
- Password reset via email
- Persistent login using `localStorage` + Supabase session listener

### 📝 Posts System
- Create, edit, and delete posts
- Image URL support
- Nested replies (threaded posts)
- Real-time refresh after updates
- User ownership validation

### 👍 Likes System
- Toggle like/unlike per user per post
- Stored in separate `birdLikesTable`
- Live like count updates

### 🔎 Search & Sorting
- Search posts by title or body (`ilike`)
- Sort by:
  - Created time
  - Likes

### 🧵 Threaded UI
- Thread style parent → child replies
- Thread reconstruction using recursive DB queries

### 🤖 AI Features (WebLLM)
- Client-side LLM using `@mlc-ai/web-llm`
- Local model: Llama 3 (1B Instruct)
- Generates:
  - Post summaries (1–3 sentences)
- Fully runs in browser (no backend cost)

### 🔥 UI Features
- React Router navigation
- Conditional rendering for logged-in users
- Toast-style delete notifications
- Responsive card-based layout
- Clean dark theme UI

---

## 🧱 Tech Stack

- **Frontend:** React, React Router, CSS
- **Backend (BaaS):** Supabase
- **Auth:** Supabase Auth
- **Database:** PostgreSQL (via Supabase)
- **AI:** WebLLM (`@mlc-ai/web-llm`)
- **Hosting:** Vercel

---

## 🗄️ Database Schema

### `birdPosts`
| column     | type   |
|------------|--------|
| id         | uuid   |
| created_at | timestamp |
| title      | text   |
| body       | text   |
| imgURL     | text   |
| likes      | int    |
| parentID   | uuid (nullable) |
| userID     | uuid   |

### `birdLikesTable`
| column     | type |
|------------|------|
| id         | uuid |
| postID     | uuid |
| userID     | uuid |
| created_at | timestamp |

---

## 🔐 Row Level Security (RLS)

Supabase RLS policies control:
- Insert: only authenticated users allowed
- Update/Delete: only post owners
- Select: public feed access (configurable)

---
