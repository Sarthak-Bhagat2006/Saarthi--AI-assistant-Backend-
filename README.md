
# Saarthi AI Assistant
## Live Demo

👉 [https://Saarthi-Live.com](https://saarthi-ai-assistant-frontend.vercel.app/#/)

<img width="1440" height="900" alt="Screenshot 2026-01-08 at 5 48 27 PM" src="https://github.com/user-attachments/assets/6a3e9ee1-21aa-426d-8688-24cc7564e21a" />


**Saarthi Backend** is the server-side application powering the Saarthi AI Assistant platform. It handles authentication, chat messages, and AI-powered interactions using Gemma-3N. Built with scalability and security in mind, the backend ensures smooth operations for real-time and AI-assisted tasks.


## 🚧 Project Status

🟢 **Functional (MVP Complete)**  
Core features are implemented and working. Further enhancements and optimisations are planned

## ✨ Features

- 🔐 **Authentication & Authorization** – Secure login and registration with JWT and Passport.js.  
- 🤖 **AI Integration** – Forward prompts to Gemma-3N (OpenRouter API) and handle contextual responses.  
- 📊 **Data Management** – MongoDB schemas for users, groups, and chat threads storing 5k+ messages.  

## 🛠️ Tech Stack
  
**Backend**

- Node.js, Express  
- REST APIs  
- Passport.js (JWT / Session Authentication)  

**Database**
- MongoDB (Mongoose)  

**AI Integration**
- OpenRouter API (Gemma-3N)  

**Tools**
- Git & GitHub  
 

## 🤝 How to Contribute

Contributions are welcome! If you’d like to improve **ChargeHub**, you can follow the steps below 🚀

```bash
# Fork the repository on GitHub, then clone your fork
git clone <url>
cd ChargeHub

# Install dependencies
npm install

# Run the project locally
nodemon server.js

# Create a new branch for your changes
git checkout -b feature/your-feature-name

# Commit and push your changes
git add .
git commit -m "Describe your change"
git push origin feature/your-feature-name
