# 🏨 Hostel Management & Complaint System 🎓

A full-featured, robust web-based **Hostel Management & Complaint System** designed to digitize and simplify hostel operations. Built using the modern **MERN Stack (MongoDB, Express.js, React.js (Vite), Node.js)**, this system ensures seamless communication, efficient task management, and a better living experience for students, wardens, staff, and administrators. 🚀

---

## ✨ Key Features

- 🔐 **Role-Based Dashboards:** Secure and dedicated dashboards for Admin, Chief Warden, Warden, Staff, and Students  
- 🛏️ **Room Management:** Efficient room allocation, availability tracking, and student assignments  
- 📝 **Complaint Management:** Raise, track, and resolve complaints with a clear status workflow  
- 📅 **Leave Management:** Structured leave request system with approval/rejection by wardens  
- 🍲 **Mess Management:** Weekly menu updates and mess tracking for students  
- 📢 **Notice Board:** Centralized platform for sharing important announcements  
- 🚨 **Emergency / SOS:** Quick alert system for handling urgent situations  
- 👥 **User Management:** Admin-level control to manage users and roles  

---

## 🎭 User Roles & Responsibilities

- 👑 **Admin / Chief Warden:**  
  Full system control, including user management, room and mess configuration, and handling escalations  

- 👮 **Warden:**  
  Manages room allotments, approves/rejects leave requests, and assigns complaints to staff  

- 👷 **Staff:**  
  Handles assigned complaints and updates their status until resolution  

- 👨‍🎓 **Student:**  
  Raises complaints, applies for leave, and views notices and mess menu  

---

## 🛠️ Tech Stack

**Frontend 💻:**
- ⚛️ **React.js** (Powered by **Vite** ⚡ for ultra-fast builds)
- 🎨 **Tailwind CSS** (For a sleek, modern UI styling)
- 🧭 **React Router DOM** (For smooth navigation)
- 🪶 **Lucide React** (For beautiful, accessible icons)

**Backend ⚙️:**
- 🟢 Node.js & 🚂 Express.js (Fast & scalable server)
- 🍃 MongoDB & Mongoose (NoSQL Database)
- 🔑 JSON Web Token (JWT) & bcryptjs (Secure Authentication & Hashing)
- 📁 Multer (For efficient file handling)

---

## 📂 Project Structure

```text
Minor Project/
│
├── ⚙️ Backend/                 # Express Server, Mongo Models, API Routes
│   ├── package.json
│   └── server.js
│
├── 🎨 Frontend/                # Vite React App
│   ├── src/
│   │   ├── components/      # UI components (Navbar, Sidebar, etc.)
│   │   ├── pages/           # Views (Dashboards, RoomAllotment, etc.)
│   │   └── index.css        # Tailwind configurations
│   └── package.json
│
└── 📄 Readme.md
```

---

## 🚀 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Himanshuagrawal2003/Minor-Project.git
cd Minor-Project
```

### 2️⃣ Setup Backend

Open a terminal and navigate to the backend directory:
```bash
cd Backend
npm install
```

**🔑 Environment Variables:** Create a `.env` file in the `Backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**▶️ Run the backend server:**
```bash
npm run dev
# Server generally starts on 🔗 http://localhost:5000
```

### 3️⃣ Setup Frontend

Open a new terminal and navigate to the frontend directory:
```bash
cd Frontend
npm install
```

**🔑 Environment Variables:** If needed, create a `.env` file in the `Frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**▶️ Run the frontend app:**
```bash
npm run dev
# Frontend generally starts on 🔗 http://localhost:5173
```

---

## 👨‍💻 Team Members

- 🧑‍💻 **Aditya Pratap Singh Chauhan**  
- 🧑‍💻 **Anirudh Bagdi**  
- 🧑‍💻 **Dhruv Patidar**  
- 🧑‍💻 **Himanshu Agrawal**  

---

## 🔮 Future Enhancements

- 💳 **Payment Gateway Integration:** For seamless mess and hostel fee payments.
- 💬 **Real-time Chat:** Direct in-app communication between students and wardens.
- 📩 **Automated Notifications:** Email and SMS alerts using third-party services.
- 📱 **Progressive Web App (PWA):** Installable mobile-friendly app support.

---

## 📜 License & Purpose

<p align="center">
 This project is passionately developed for <strong>academic purposes (Minor Project)</strong>. 🎓
</p>
