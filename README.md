# Job Finder - AI Cover Letter Assistant

An AI-powered job application assistant that generates personalized cover letters based on job descriptions.

## Features

- **AI Cover Letter Generator**: Create tailored cover letters using OpenAI's GPT model
- **PDF Generation**: Download cover letters as professionally formatted PDF files
- **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui components
- **Tab Layout**: Ready for future CV builder functionality

## Tech Stack

### Backend

- **NestJS**: Modern Node.js framework
- **OpenAI API**: AI-powered text generation
- **PDFKit**: PDF generation
- **TypeScript**: Type-safe development

### Frontend

- **React**: UI framework
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Server state management
- **shadcn/ui**: Modern UI components
- **TypeScript**: Type-safe development

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- OpenAI API key

### Installation

1. **Install dependencies**:

   ```bash
   yarn install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the `backend/` directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

### Running the Application

1. **Start the backend**:

   ```bash
   npx nx serve backend
   ```

   The API will be available at `http://localhost:3000`

2. **Start the frontend** (in a new terminal):
   ```bash
   npx nx serve frontend
   ```
   The app will be available at `http://localhost:4200`

## Usage

1. Navigate to `http://localhost:4200`
2. Fill in the cover letter form:
   - **Job Title**: The position you're applying for
   - **Company Name**: The company name
   - **Job Description**: Paste the complete job description
3. Click "Improve ✨" to generate your cover letter
4. The PDF will automatically download

## API Endpoints

### POST /api/job/cover-letter

Generates a cover letter PDF based on job details.

**Request Body**:

```json
{
  "jobTitle": "Senior Software Engineer",
  "companyName": "Google",
  "jobDescription": "We are looking for..."
}
```

**Response**: PDF file download

## Project Structure

```
job-finder/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── ai/             # AI module (OpenAI integration)
│   │   ├── job/            # Job module (PDF generation, API endpoints)
│   │   └── app/            # Main app module
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── lib/           # Utilities and API client
│   │   └── app/           # Main app component
└── README.md
```

## Future Features

- **CV Builder**: AI-powered resume generation
- **User Authentication**: Save and manage multiple cover letters
- **Template Selection**: Choose from different cover letter styles
- **Company Research**: Automatic company information lookup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
