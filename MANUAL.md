# 🚍 TransTrack: School Transport & Fee Management System
### 📖 Comprehensive User Manual & Administrator Guide (Version 1.0)

Welcome to **TransTrack**, a highly polished, production-ready full-stack School Transport and Fee Management System. This system is designed for modern schools to manage their fleet, student enrollments, transit routes, and fee collections in real-time, utilizing **MongoDB Atlas** as the secure cloud database of truth.

---

## 📂 Table of Contents
1. **System Overview**
2. **Setup & Deployment Guide**
3. **🔑 Portal 1: Administrator Dashboard & Operations**
   * Student Enrollment & Management
   * Bulk Importing from Excel / CSV
   * Fleet & Route Control
   * Fee Payment Processing & Ledger
   * Analytics & Automated Reminders
4. **🎒 Portal 2: Student Transit & Parent Portal**
   * Live Boarding Status
   * Interactive Transit Map & Pickup Stops
   * Fee Status & Online Receipt Downloading
5. **🛡️ Data Security & Best Practices**

---

## 1. System Overview

TransTrack utilizes a dual-portal layout designed with modern responsive principles:
* **Admin Portal**: A high-density dashboard allowing complete control over routes, buses, stops, student enrollment, bulk data imports, automated alerts, and audit trail logs.
* **Student/Parent Portal**: A simple, mobile-optimized experience for parents and students to monitor bus details, view scheduled stops, check fee due statements, and print payment receipts.
* **Database Engine**: Built natively on **Mongoose / MongoDB Atlas** for sub-millisecond query performance, absolute data persistence, and automatic cross-portal synchronization.

---

## 2. Setup & Deployment Guide

To deploy TransTrack on your local machine, server, or cloud hosting (e.g., Heroku, Cloud Run, AWS), follow these steps:

### Prerequisites
* Node.js (v18 or higher)
* A running MongoDB Database instance (local or Atlas)

### Step-by-Step Installation

1. **Extract Project Files**
   Download and extract the zip file of this project directory.
   
2. **Configure Environment Variables**
   Open the `.env` file at the root level and configure your connection strings:
   ```env
   # .env
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/BusFee"
   JWT_SECRET="YourSecretKeyHere"
   PORT=3000
   ```

3. **Install Dependencies**
   Run the following command in your terminal to download and install all required modules:
   ```bash
   npm install
   ```

4. **Launch the Development Server**
   To run in hot-reloading development mode:
   ```bash
   npm run dev
   ```

5. **Build & Start for Production**
   To compile the TypeScript code and start the high-performance Node production server:
   ```bash
   npm run build
   npm start
   ```

---

## 3. 🔑 Portal 1: Administrator Dashboard & Operations

The Admin Portal is the central cockpit of the system. It adjusts fluidly to desktops, tablets, and mobile screens.

### 👥 Student Enrollment & Management
* **Enrolling a Student**:
  1. Click **Enrol New Student** on the top right.
  2. Input the student's name, class, section, and admission number.
  3. Select their assigned **Bus Route**. The system automatically updates the assigned bus number, driver details, and fee structure based on the chosen route's first stop.
  4. Input the parent's name and **10-digit WhatsApp phone number**.
  5. Click **Enrol Student**. The record is saved in MongoDB, and a secure student account is initialized automatically.
* **Filtering and Search**: Use the top filter bar to instantly locate students by Class, Section, Route, or searching for keywords (Name, Student ID, Phone).

### 📊 Bulk Importing from Excel / CSV
* Perfect for starting a new academic year!
* **How to import**:
  1. Go to **Bulk Import Excel** in the sidebar.
  2. Download the pre-formatted CSV template.
  3. Populate your student roster in the template, ensuring `studentId`, `admissionNumber`, `name`, `class`, `section`, `parentName`, and `parentPhone` are present.
  4. Drag & drop or upload the file into the upload zone.
  5. The system parses, validates, and uploads all valid student records directly to your MongoDB in seconds!

### 🚌 Fleet & Route Control
* **Routes**: Create custom routes (e.g., "North Express", "South Main Route"), assign drivers, specify their phone numbers, and link them to designated bus vehicles.
* **Stops**: Assign multiple stops to each route, set their stop sequence order, and specify the customized term-fee per stop. Students assigned to that stop will automatically receive correct billing dues.

### 💳 Fee Payment Processing & Ledger
* **Receiving Payments**:
  1. Go to the **Fee Payments** screen.
  2. Select any student.
  3. Click **Collect Fee**.
  4. Specify the Term (Term 1 or Term 2), the amount being paid, and the payment mode (Cash, GPay, Bank Transfer, Card).
  5. The system records the payment securely, recalculates the student's pending balance in MongoDB, logs an audit trail, and renders a downloadable PDF receipt.

### 🔔 Analytics & Automated Reminders
* **Pending Dues Section**: View a list of all students with outstanding balances.
* **Send WhatsApp Alert**: Click the WhatsApp icon next to a student. The system instantly initializes a friendly, professional pre-filled template message addressed to the parent, stating the outstanding dues and terms, ready to send with one click!

---

## 4. 🎒 Portal 2: Student Transit & Parent Portal

The Student Portal is styled as a mobile-first web app, making it extremely easy for parents to view on their phones.

### 🚌 Live Boarding Status
* Parents can see their student's current route details, the assigned bus registration number, and the driver's name with an interactive "Call Driver" button for instant safety check-ins.

### 📍 Interactive Transit Map & Pickup Stops
* Displays a clean route timeline showing all scheduled stops, indicating which stop is the student's allocated pickup point along with the fee associated with it.

### 📄 Fee Status & Online Receipt Downloading
* Highlights "Term 1" and "Term 2" payment statuses with colored badges:
  * 🟢 **Paid**
  * 🟡 **Partial**
  * 🔴 **Pending**
* Includes an **"Invoice Receipt"** downloader. Parents can click **Download Receipt** for completed terms to instantly generate and print a formal receipt containing the school header, student ID, payment reference, and transaction details.

---

## 5. 🛡️ Data Security & Best Practices

1. **Keep Secrets Hidden**: Never expose your `MONGODB_URI` or `JWT_SECRET` in public client-side files. Always proxy requests through the Express backend `/api` endpoints.
2. **Database Backups**: Since MongoDB Atlas is our single source of truth, utilize Atlas's automatic cloud backup feature to protect your data against accidental administrative resets.
3. **Input Validation**: Phone numbers must be entered as clean 10-digit formats (the system automatically prepends the country code for messaging consistency).

---
*Manual compiled by TransTrack Engineering Team. Keep this file in your project directory as a ready reference for administrative training and client handover.*
