I want to create assistant to apply to jobs. I want to start with AI cover letter builder based on job description. In the future i want to add also CV builder based on job description.


# Tasks:

## Setup
- Setup NX project that would have 2 apps, web and backend. Use Nest for backend and vite with react for frontend.
- I would use open api key to connect to AI

## Fronted
- Use tailwind + vite + shadcn for styles
- use tanstack query for api calls. Use any fetcher that allows to provide return type
- Layout should include 2 tabs: 1st is cover letters, 2nd (coming soon) cv builder
- Cover letters tab should include, 3 fields. 1 job title, 2 company name, 3 job description. And a button "Improve `sparks`". After pressing button request should go to backend

## Backend
- use nestjs, openai
- create 2 modules, AI module, job module. Ai module will include all settings for AI and requests to AI. There also should be space for cover letter template based on which AI will generate cover letter.
- job module should include endpoints required for frontend to communicate with AI
- cover letter should be returned in PDF format