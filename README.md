

***

# E-Commerce Product Recommender  
## Project Report

**Name:** Ishan Sharma  
**Roll Number:** 22BCE11621  

**GitHub Repository:** https://github.com/Ishur1302/Ishan-Sharma_22BCE11621_E-commerce-Product-Recommender-  
**Deployed URL:** [Live Demo](https://your-vercel-deployment-url.vercel.app)
**Demo Video:** [Google Drive Demo Link](https://drive.google.com/file/d/1VLsfNkK0rzUOMqsmoJ5Zr_1GogQCd_6P/view?usp=sharing)  
**Project Topic:** E-commerce Product Recommendation System with LLM-powered Explanations

***

## Objective  
This project aims to develop an intelligent product recommendation system for e-commerce platforms. It not only suggests relevant products based on user data but also generates human-like, informative explanations for the recommendations via a Large Language Model (LLM). This approach enhances user trust by providing understandable reasons for each suggestion.

***

## Scope of Work  
- **Input:**  
  - Product catalog containing details, categories, prices, images etc.  
  - User behavioral data including search history, previous purchases, clicks, wishlist, and more.

- **Output:**  
  - Personalized product recommendations tailored to each user.  
  - LLM-generated explanations clarifying "Why this product?" based on user context.

- **Frontend Dashboard (Optional):**  
  - UI to view recommended products and their explanations.

***

## Technical Architecture  
- **Backend API:** Built with Node.js/TypeScript and Express or FastAPI for processing inputs and generating recommendations and explanations.  
- **Database:** Uses MongoDB or PostgreSQL to store product info, user data, and interaction logs.  
- **Recommendation Logic:** Combines collaborative filtering and content-based filtering (using libraries like LightFM or Surprise).  
- **LLM Integration:** Utilizes APIs like OpenAI GPT or Llama models to produce detailed descriptive explanations.

***

## Example Prompt for LLM  
"Explain why product X is recommended to this user based on their behavior."  

**Example Output:**  
"Product X is suggested because you have previously shown interest in electronics, and this product aligns with your preferred price range and past purchases."

***

## Deliverables  
- Well-structured GitHub repository with source code and documentation.  
- Detailed README including setup and usage instructions.  
- Demo video showcasing recommendation scenarios and LLM explanations.

***

## Recommendation System Methodology  
- **Collaborative Filtering:** Recommends products liked by users with similar interaction patterns.  
- **Content-Based Filtering:** Matches user preferences with product attributes for personalized recommendations.  
- **Hybrid Approach:** Uses both techniques for accuracy and better handling of sparse data.  
- **Explanation Generation:** Each suggested product comes with a customizable natural language explanation via LLM.

***

## Example User Flow  
1. User logs into the system.  
2. User interaction history is analyzed.  
3. Recommendations are computed based on behaviors.  
4. Descriptive context is prepared and sent to LLM.  
5. LLM returns personalized explanations.  
6. Frontend displays recommended products with explanations.

***

## Database Design  
- **Products:** ProductID, Name, Description, Category, Price, ImageURL  
- **Users:** UserID, Email, Demographics, Preferences  
- **Interactions:** UserID, ProductID, Action (view, purchase, wishlist), Timestamp  

***

## API Endpoints  
- `GET /recommendations?user_id=...` — Fetch recommendations and explanations for a user.  
- `POST /user-interaction` — Log user actions.  
- `GET /products` — Retrieve product catalog.

***

## LLM and Prompt Engineering  
- Prompts dynamically constructed from user and product data.  
- Ensures clarity and personalization in LLM-generated explanations.

***

## Evaluation Criteria  
- Accuracy of recommendations.  
- Human-likeness and relevance of LLM explanations.  
- Clean, modular codebase.  
- Comprehensive documentation.

***

## Deployment  
- Supports deployment on cloud platforms: Vercel, Netlify, AWS, or Render.  
- Database hosted using managed services like MongoDB Atlas or AWS RDS.  
- LLM accessed via API.

***

## How to Install and Run on Your Computer  

1. Clone the repository:  
   `git clone <YOUR_GIT_URL>`

2. Navigate to the project folder:  
   `cd <YOUR_PROJECT_NAME>`

3. Install required dependencies:  
   `npm i`

4. **Important:** Create a `.env` file in the root directory (`.env` is excluded from GitHub for security):
   - Copy `.env.example` to `.env`: `cp .env.example .env`
   - Update the `.env` file with your own Firebase and Gemini API keys
   - **Add `.env` to `.gitignore`** to prevent it from being committed
   - **DO NOT commit the `.env` file to GitHub**

5. **Configure Firebase Security Rules:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Firestore Database → Rules
   - Copy the contents of `firestore.rules` and paste into the Firebase Console
   - Publish the rules

6. Initialize Firestore database:
   - Start the dev server: `npm run dev`
   - Open browser console and run: `initializeFirestore()` to seed products

7. Start the development server with hot reload:  
   `npm run dev`

Make sure [Node.js](https://nodejs.org/) and npm are installed. You can use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions easily.

Open your browser and go to the URL displayed in terminal (usually http://localhost:8080) to see the application running locally.

***


[9](https://www.kaggle.com/code/shawamar/product-recommendation-system-for-e-commerce)
[10](https://wangcongcong123.github.io/files/bechelor-thesis/report.pdf)
