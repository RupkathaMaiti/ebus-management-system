Ebus Management System
Project Overview
This project is a web-based Ebus Management System designed to facilitate real-time bus information posting by drivers and viewing/searching by users. It leverages Firebase for backend services, including authentication and a NoSQL database.

Features
User Authentication: Secure registration and login for different user types (Admin, Driver, User).

Role-Based Access Control:

Admin: Can register new Driver accounts.

Driver: Can log in and post bus details (Bus Number, Route, Type, Contact Info).

User (Passenger): Can register, log in, view all available bus details, and search/filter buses by source and destination.

Real-time Data: Bus information is stored and retrieved from Firebase Firestore.

Responsive Design: (Implicitly, as we used basic CSS for adaptability).

Comprehensive Logging: Detailed console logging for all major application actions.

Cloud Deployment: Hosted on Firebase Hosting for public access.

Technologies Used
Frontend: HTML, CSS, JavaScript

Backend/Database/Authentication/Hosting: Google Firebase

Firebase Authentication (Email/Password)

Firebase Firestore (NoSQL Database)

Firebase Hosting

Setup and Local Development
Prerequisites
Node.js (LTS version recommended) and npm (Node Package Manager)

Git

A Google account

A Firebase Project (configured with Authentication and Firestore)

Installation Steps
Clone the Repository:

git clone https://github.com/YOUR_GITHUB_USERNAME/ebus-management-system.git
cd ebus-management-system

(Remember to replace YOUR_GITHUB_USERNAME with your actual GitHub username)

Install Firebase CLI:
If you haven't already, install the Firebase Command Line Interface globally:

npm install -g firebase-tools

Log in to Firebase CLI:
Authenticate the CLI with your Google account:

firebase login

Follow the browser prompts to complete the login.

Configure Firebase Project:
Ensure your Firebase project (ebus-management-system-27b5a or your project ID) is set up with:

Authentication: Email/Password sign-in method enabled.

Firestore Database: Rules set to allow read/write in test mode (for development).

Web App Configuration: Copy your Firebase project's web app configuration.

Update Firebase Configuration in index.html:
Open index.html and locate the <script type="module"> block in the <head>. Replace the placeholder firebaseConfig object with your actual project's configuration.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    // measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

Also ensure the Firebase SDK import URLs match your project's recommended versions (e.g., https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js).

Initialize Firebase Hosting (if not already done correctly):
If you haven't initialized Firebase Hosting within this project directory correctly, run:

firebase init

Select Hosting.

Choose your ebus-management-system-27b5a project.

Set public directory to . (a single dot).

Do NOT configure as a single-page app.

Do NOT set up GitHub deploys (for now).

Do NOT overwrite .gitignore.

Running the Application Locally
To run the application on your local machine:

Ensure you are in the project's root directory in your terminal.

Open index.html directly in your web browser.

file:///path/to/your/ebus-management-system/index.html

For better local development, you can use a simple local server (e.g., Python's http.server):

python -m http.server

Then access at http://localhost:8000.

Deployment
This application is deployed using Firebase Hosting.
To deploy updates:

Ensure you are in the project's root directory in your terminal.

Run the deployment command:

firebase deploy --only hosting

Your application will be accessible at the Hosting URL provided by the CLI (e.g., https://ebus-management-system-27b5a.web.app).

Usage
User Roles
User: Can register/login and view/search bus information.

Driver: Can login, post bus information (number, route, type, contact).

Admin: Can login and register new Driver accounts.

How to get different roles:
Regular User: Register via the main "Register" form.

Admin: Register as a regular user, then manually change their role field to 'admin' in Firebase Firestore (under users collection, document ID is user's UID).

Driver: Log in as an Admin, then use the "Admin Panel: Register Driver" form to create new driver accounts.

Core Functionality
Posting Bus Information:

Log in as a Driver or Admin.

Fill in Bus Number, Route, Type, and Contact.

Click "Post Bus Information".

Viewing Bus Information:

Log in as any user type.

The "Live Bus Information" section will display all posted buses.

Searching Buses:

Log in as any user type.

Enter "Source" and/or "Destination" in the search fields.

Click "Search Buses".

Click "Clear Search" to view all buses again.

Logging
The application includes comprehensive console logging for key actions (e.g., user registration, login, data posting, search, errors) to aid in debugging and tracking application flow. Open your browser's Developer Console (F12) to view logs.

Optimization Notes
This section outlines potential areas for optimization and future enhancements to the Ebus Management System. While not implemented in the current version, these considerations are important for scalability, performance, and user experience.

1. Database Query Optimization (Search Functionality)
Current Approach: The current search functionality fetches all bus documents from Firestore and then filters them client-side in JavaScript.

Optimization: For a large number of bus entries, this approach can become inefficient and slow.

Server-Side Filtering: Implement more precise Firestore queries using where() clauses if the search criteria can be matched directly (e.g., exact match for source/destination if they were separate fields).

Full-Text Search Service: For advanced "contains" (substring) searches on the busRoute field, integrate with a dedicated full-text search service like Algolia, ElasticSearch, or a Firebase Extension for Algolia. This offloads complex search logic from the client and Firestore.

2. User Interface/Experience (UI/UX) Enhancements
Loading States: Implement more explicit loading indicators (spinners, skeleton screens) when data is being fetched or actions are being processed, especially for bus information display and authentication.

Error Messages: Replace generic alert() messages with more user-friendly, non-blocking modal dialogs or inline error messages within the UI.

Form Validation: Enhance client-side form validation beyond simple empty checks (e.g., email format, password strength indicators, numeric checks for contact info).

Real-time Updates for Bus Location: (Future Scope) Integrate with a real-time location tracking API (e.g., Google Maps API) for drivers to update their live location, and for users to see buses on a map. This would involve more complex data structures and potentially Firestore real-time listeners (onSnapshot).

3. Security Enhancements
Firestore Security Rules: While currently in "test mode" (allowing broad access), implement granular Firestore Security Rules to restrict read/write access based on user roles (request.auth.uid, request.resource.data.postedByUid). For example:

Only authenticated users can read buses.

Only 'driver' or 'admin' roles can write to buses.

User profiles (users collection) can only be written by the respective user's UID.

Admin Panel Security: The "Admin Panel: Register Driver" is currently hidden by UI logic. For production, add server-side validation (e.g., Firebase Cloud Functions) to ensure only users with the 'admin' role can actually create driver accounts, preventing malicious users from bypassing client-side checks.

4. Code Structure and Maintainability
Modularization: For larger applications, break down script.js into smaller, more focused modules (e.g., auth.js, busService.js, ui.js) using ES Modules (import/export).

Framework Adoption: For more complex UIs and state management, consider adopting a JavaScript framework like React, Vue.js, or Angular.

Test Cases
This section outlines a set of test cases to verify the functionality and behavior of the Ebus Management System. These tests cover various user roles and core features.

Authentication & Role Management
Test Case: User Registration (Valid)

Scenario: A new user registers with a valid, unique email and a password (min 6 chars).

Steps:

Navigate to the registration form.

Enter valid email (e.g., newuser@example.com).

Enter a password (e.g., password123).

Click "Register".

Expected Result:

"Registration successful!" message displayed.

User is automatically logged in.

User's email and (user) role are displayed in the header.

Only "Live Bus Information (User Module)" is visible.

A new user entry exists in Firebase Authentication.

A corresponding document with role: 'user' exists in Firestore users collection (Document ID = User UID).

Test Case: User Registration (Invalid - Email Exists)

Scenario: A user tries to register with an email that already exists.

Steps:

Navigate to the registration form.

Enter an existing email (e.g., existing@example.com).

Enter a password.

Click "Register".

Expected Result:

"Registration failed: Firebase: The email address is already in use by another account." message displayed.

User remains on the registration form, not logged in.

Test Case: User Registration (Invalid - Short Password)

Scenario: A user tries to register with a password less than 6 characters.

Steps:

Navigate to the registration form.

Enter a valid email.

Enter a short password (e.g., 123).

Click "Register".

Expected Result:

"Password should be at least 6 characters." message displayed.

User remains on the registration form, not logged in.

Test Case: User Login (Valid - User Role)

Scenario: A registered user (with role: 'user') logs in successfully.

Steps:

Navigate to the login form.

Enter valid user email and password.

Click "Login".

Expected Result:

"Login successful! Welcome, [email] (user)." message displayed.

User's email and (user) role are displayed in the header.

Only "Live Bus Information (User Module)" is visible.

Test Case: User Login (Valid - Driver Role)

Scenario: A registered driver (with role: 'driver') logs in successfully.

Steps:

Navigate to the login form.

Enter valid driver email and password.

Click "Login".

Expected Result:

"Login successful! Welcome, [email] (driver)." message displayed.

Driver's email and (driver) role are displayed in the header.

"Post Bus Information (Driver Module)" and "Live Bus Information (User Module)" are visible.

Test Case: User Login (Valid - Admin Role)

Scenario: A registered admin (with role: 'admin') logs in successfully.

Steps:

Navigate to the login form.

Enter valid admin email and password.

Click "Login".

Expected Result:

"Login successful! Welcome, [email] (admin)." message displayed.

Admin's email and (admin) role are displayed in the header.

"Admin Panel: Register Driver", "Post Bus Information (Driver Module)", and "Live Bus Information (User Module)" are all visible.

Test Case: User Login (Invalid Credentials)

Scenario: A user tries to log in with incorrect email or password.

Steps:

Navigate to the login form.

Enter incorrect email/password.

Click "Login".

Expected Result:

"Login failed: Firebase: Error (auth/invalid-credential)." or similar error message displayed.

User remains on the login form, not logged in.

Test Case: Logout Functionality

Scenario: A logged-in user logs out.

Steps:

Log in as any user type.

Click "Logout".

Expected Result:

Application returns to the authentication (login/register) view.

User email display in header is cleared.

All role-specific content sections are hidden.

Test Case: Admin Registers Driver (Valid)

Scenario: An admin user registers a new driver account.

Steps:

Log in as an Admin.

In the "Admin Panel: Register Driver" section, enter a new, valid email and password for a driver.

Click "Register Driver".

Expected Result:

"Registration successful! User [email] created as driver." message displayed.

New driver account appears in Firebase Authentication.

A document with role: 'driver' exists in Firestore users collection for the new driver.

Input fields are cleared.

Bus Information Management
Test Case: Driver Posts Bus Information (Valid)

Scenario: A driver (or admin) posts complete and valid bus information.

Steps:

Log in as a Driver or Admin.

In the "Post Bus Information" section, fill in all fields (Bus Number, Route, Bus Type, Contact Info).

Click "Post Bus Information".

Expected Result:

Input fields are cleared.

The newly posted bus appears in the "Live Bus Information" list.

A new document for the bus exists in Firestore buses collection.

Test Case: Driver Posts Bus Information (Missing Fields)

Scenario: A driver (or admin) attempts to post bus information with one or more fields left empty.

Steps:

Log in as a Driver or Admin.

In the "Post Bus Information" section, leave one or more fields empty.

Click "Post Bus Information".

Expected Result:

alert() message "Please fill in all bus information fields..." displayed.

Bus information is NOT posted to Firestore.

Input fields are NOT cleared.

Test Case: Regular User Attempts to Post Bus Information

Scenario: A regular user (with role: 'user') tries to post bus information.

Steps:

Log in as a User.

(Attempt to click the hidden "Post Bus Information" button if it were visible, or observe that the section is hidden).

Expected Result:

The "Post Bus Information (Driver Module)" section is not visible to the user.

(If the button were somehow clicked) alert() message "Only users with a 'driver' or 'admin' role can post bus information." displayed.

Bus Search & Display
Test Case: Display All Buses (No Search Filters)

Scenario: A user logs in or clears search filters.

Steps:

Log in as any user type.

Ensure Source and Destination search fields are empty.

(If previously searched) Click "Clear Search".

Expected Result:

All bus entries currently in Firestore are displayed in the "Live Bus Information" list.

"No bus information available yet." message if no buses are posted.

Test Case: Search by Source Only (Valid Match)

Scenario: A user searches for buses by a valid source that exists in some routes.

Steps:

Log in as any user type.

Enter a source (e.g., "Kharagpur") in the "Source" field.

Leave "Destination" empty.

Click "Search Buses".

Expected Result:

Only buses whose route string contains "Kharagpur" (case-insensitive) are displayed.

Buses not matching the source are hidden.

Test Case: Search by Destination Only (Valid Match)

Scenario: A user searches for buses by a valid destination that exists in some routes.

Steps:

Log in as any user type.

Leave "Source" empty.

Enter a destination (e.g., "Kolkata") in the "Destination" field.

Click "Search Buses".

Expected Result:

Only buses whose route string contains "Kolkata" (case-insensitive) are displayed.

Buses not matching the destination are hidden.

Test Case: Search by Both Source and Destination (Valid Match)

Scenario: A user searches for buses by both source and destination, and a match exists.

Steps:

Log in as any user type.

Enter a source (e.g., "Kharagpur") in the "Source" field.

Enter a destination (e.g., "Kolkata") in the "Destination" field.

Click "Search Buses".

Expected Result:

Only buses whose route string contains both "Kharagpur" AND "Kolkata" (case-insensitive) are displayed.

Test Case: Search (No Match Found)

Scenario: A user searches for criteria that do not match any existing bus routes.

Steps:

Log in as any user type.

Enter a unique, non-existent source/destination (e.g., Source: "Moon", Destination: "Mars").

Click "Search Buses".

Expected Result:

"No buses found matching your search criteria." message displayed.

No bus cards are visible.

Test Case: Clear Search Filters

Scenario: A user clears active search filters.

Steps:

Perform a search that filters the bus list.

Click "Clear Search".

Expected Result:

"Source" and "Destination" input fields are cleared.

All bus entries currently in Firestore are displayed again.


Contact
Name-Rupkatha Maiti
Email-rupkatha.maitie@gmail.com
GitHub Profile-https://github.com/RupkathaMaiti)
