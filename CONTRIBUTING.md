# 🤝 Contributing to BookShelf

First off, thank you for considering contributing to **BookShelf**! 🎉

We welcome contributions of all sizes—from fixing typos and improving documentation to implementing new features and fixing bugs. Whether you're a beginner or an experienced developer, your contributions are appreciated.

---

# 📖 Table of Contents

- Code of Conduct
- Before You Start
- Prerequisites
- Project Setup
- Project Structure
- Branch Naming Convention
- Commit Message Guidelines
- Coding Standards
- Development Workflow
- Issue Reporting
- Pull Request Process
- Contributor Checklist
- Best Practices
- Need Help?

---

# 📜 Code of Conduct

Please be respectful and maintain a welcoming environment for everyone.

If this repository contains a **CODE_OF_CONDUCT.md**, please read and follow it before contributing.

---

# 🚀 Before You Start

Before working on any issue:

- Star the repository ⭐
- Fork the repository
- Read the README carefully
- Check existing Issues and Pull Requests
- Comment on an issue before starting work
- Wait until the issue is assigned to you (if assignment is required)

---

# 📦 Prerequisites

Make sure you have:

- Git
- Node.js (Latest LTS Recommended)
- npm
- VS Code (Recommended)

Verify installation:

```bash
node -v
npm -v
git --version
```

---

# ⚙️ Project Setup

## 1. Fork the Repository

Click the **Fork** button on GitHub.

---

## 2. Clone Your Fork

```bash
git clone https://github.com/<your-username>/Book-Shelf.git
```

---

## 3. Navigate into the Project

```bash
cd Book-Shelf
```

---

## 4. Install Frontend Dependencies

```bash
cd bookshelf-frontend
npm install
```

---

## 5. Start the Frontend

```bash
npm run dev
```

---

## 6. Backend (If Available)

```bash
cd bookshelf-backend
npm install
npm start
```

---

# 📁 Project Structure

```
Book-Shelf/
│
├── bookshelf-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── bookshelf-backend/
│   ├── routes/
│   ├── controllers/
│   ├── data/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 🌿 Branch Naming Convention

Always create a new branch before making changes.

Examples:

```
feature/add-dark-mode
feature/add-book-card
feature/add-search

bugfix/navbar-overlap
bugfix/cart-error

docs/update-contributing
docs/improve-readme

refactor/navbar-component
```

Create a branch:

```bash
git checkout -b feature/your-feature-name
```

---

# 💬 Commit Message Guidelines

Write meaningful commit messages.

Good Examples:

```
feat: add search functionality

fix: resolve navbar responsiveness issue

docs: update CONTRIBUTING guide

style: improve button spacing

refactor: simplify BookCard component
```

Avoid messages like:

```
update

changes

fixed

done
```

---

# 🎨 Coding Standards

## React

- Use functional components
- Prefer reusable components
- Keep components small
- Use descriptive names

Example:

```
BookCard.jsx

GenreFilter.jsx

Navbar.jsx
```

---

## JavaScript

- Use ES6+ syntax
- Use const whenever possible
- Use let only when necessary
- Avoid unused variables

---

## CSS

- Keep styling clean
- Maintain consistent spacing
- Write responsive layouts
- Avoid duplicate styles

---

## File Naming

Components:

```
BookCard.jsx

HeroSection.jsx

Footer.jsx
```

CSS Files:

```
BookCard.css

Navbar.css
```

---

# 🔄 Development Workflow

1. Fork the repository
2. Clone your fork
3. Create a new branch
4. Make changes
5. Test your changes
6. Commit your work
7. Push your branch
8. Open a Pull Request

---

# 🐞 Reporting Issues

When creating an issue, include:

- Clear title
- Description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/OS information

Please search existing issues before opening a new one.

---

# 🔥 Pull Request Guidelines

Before opening a PR:

- Ensure the project builds successfully
- Test your changes
- Keep PRs focused on a single issue
- Link the related issue
- Add screenshots for UI changes
- Resolve merge conflicts

Example PR Description:

```
## Description

Implemented responsive navbar improvements.

Fixes #12

## Changes

- Improved mobile menu
- Fixed spacing
- Added hover animations

## Screenshots

(Add screenshots here)
```

---

# ✅ Contributor Checklist

Before submitting your Pull Request:

- Project builds successfully
- Code follows project style
- No unnecessary files added
- No console errors
- Responsive UI maintained
- Documentation updated (if required)
- Related issue linked
- Screenshots included (if UI changes)
- Commit messages are meaningful

---

# ⭐ Best Practices

- Keep Pull Requests small
- Write clean and readable code
- Reuse existing components whenever possible
- Avoid breaking existing functionality
- Keep discussions respectful
- Review your code before submitting

---

# 🙌 Need Help?

If you have any questions:

- Open a GitHub Issue
- Start a GitHub Discussion (if enabled)
- Reach out to the maintainers

We're happy to help new contributors!

---

# ❤️ Thank You

Thank you for contributing to **BookShelf**.

Every contribution—big or small—helps improve the project and supports the open-source community.

Happy Coding! 🚀