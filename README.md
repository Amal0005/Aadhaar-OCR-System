# Aadhaar OCR System

A comprehensive Optical Character Recognition (OCR) system specifically designed to extract and process data from Indian Aadhaar cards. This project uses an external OCR API to read the text from Aadhaar card images and then employs custom parsing logic to extract key details such as Name, Date of Birth (DOB), Gender, Aadhaar Number, Address, and Pincode.

## Features
- **Image Processing**: Automatic resizing and compression of images using Sharp.
- **OCR Integration**: Utilizes the free OCR.space API to read text from both front and back images of the Aadhaar card.
- **Data Extraction**: Custom regex and parsing logic to intelligently locate and extract Aadhaar card details.

## Tech Stack

### Frontend (Client)
- React 19
- Vite
- TypeScript
- Axios
- ESLint

### Backend (Server)
- Node.js
- Express
- TypeScript
- Multer (File Uploads)
- Sharp (Image Processing)
- Axios & Form-Data

## Folder Structure
```text
Aadhaar OCR System/
├── client/                 # Frontend React application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   ├── uploads/            # Temporary directory for uploaded files
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Prerequisites
- Node.js (v18 or higher recommended)

## Installation

1. **Clone the repository** (or download the files)
2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```
3. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```

## Environment Variables
Create a `.env` file in the `server` directory and add the following variables:

```env
PORT=3000
OCR_SPACE_API_KEY=your_ocr_space_api_key  # Optional. Defaults to 'helloworld' for testing.
```

## Running the Application

### Start the Server
From the `server` directory, run:
```bash
npm run dev
```

### Start the Client
From the `client` directory, run:
```bash
npm run dev
```

The server will typically run on `http://localhost:3000` and the client will be available on the Vite default port (e.g., `http://localhost:5173`).
