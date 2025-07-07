
// =============================================================================
// Firebase Initialization (Handled in index.html now)
// =============================================================================

// We assume all necessary Firebase functions and services are globally available
// via the 'window' object from the <script type="module"> block in index.html.

// =============================================================================
// Get References to HTML Elements
// =============================================================================

// Main app content elements
const busNumberInput = document.getElementById('busNumber');
const busRouteInput = document.getElementById('busRoute');
const busTypeInput = document.getElementById('busType');
const contactInfoInput = document.getElementById('contactInfo');
const postBusInfoButton = document.getElementById('postBusInfoButton');
const busInfoDisplay = document.getElementById('busInfoDisplay');

// Authentication-related elements
const authSection = document.getElementById('authSection');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const registerButton = document.getElementById('registerButton');
const registerMessage = document.getElementById('registerMessage');

const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');

const showLoginLink = document.getElementById('showLogin');
const showRegisterLink = document.getElementById('showRegister');

const mainAppContent = document.getElementById('mainAppContent');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const logoutButton = document.getElementById('logoutButton');

// Role-based section elements
const adminSection = document.getElementById('adminSection');
const driverSection = document.getElementById('driverSection');
const userSection = document.getElementById('userSection');

// Admin registration elements
const adminRegisterEmailInput = document.getElementById('adminRegisterEmail');
const adminRegisterPasswordInput = document.getElementById('adminRegisterPassword');
const adminRegisterDriverButton = document.getElementById('adminRegisterDriverButton');
const adminRegisterMessage = document.getElementById('adminRegisterMessage');

// Search-related elements
const searchSourceInput = document.getElementById('searchSource');
const searchDestinationInput = document.getElementById('searchDestination');
const searchButton = document.getElementById('searchButton');
const clearSearchButton = document.getElementById('clearSearchButton');


// Global variable to store current user's role
let currentUserRole = null;

// =============================================================================
// Logging Function
// =============================================================================

/**
 * Centralized logging function for application actions.
 * This function formats and outputs log messages to the browser console.
 * In a more advanced application, this could send logs to a server,
 * a dedicated logging service, or an analytics platform.
 *
 * @param {string} level - The severity level of the log (e.g., 'INFO', 'WARN', 'ERROR').
 * @param {string} message - A descriptive message for the log entry.
 * @param {object} [data={}] - Optional, additional data relevant to the log entry (e.g., user ID, specific values).
 */
function logAction(level, message, data = {}) {
    const timestamp = new Date().toISOString(); // Get current time in ISO format
    const logEntry = {
        timestamp: timestamp,
        level: level,
        message: message,
        data: data // Include any additional data provided
    };

    // Output to console based on log level for easy filtering in browser dev tools
    if (level === 'ERROR') {
        console.error(`[${timestamp}] [${level}] ${message}`, data);
    } else if (level === 'WARN') {
        console.warn(`[${timestamp}] [${level}] ${message}`, data);
    } else {
        console.log(`[${timestamp}] [${level}] ${message}`, data);
    }
}

// =============================================================================
// UI Management Functions
// =============================================================================

/**
 * Controls the visibility of the login and registration forms.
 * @param {string} formToShow - Specifies which form to display ('login' or 'register').
 */
function showAuthForm(formToShow) {
    logAction('INFO', `Attempting to show ${formToShow} form.`);
    if (formToShow === 'login') {
        loginForm.classList.remove('hidden'); // Make login form visible
        registerForm.classList.add('hidden'); // Hide register form
        registerMessage.textContent = ''; // Clear any previous messages from register form
    } else { // 'register'
        registerForm.classList.remove('hidden'); // Make register form visible
        loginForm.classList.add('hidden'); // Hide login form
        loginMessage.textContent = ''; // Clear any previous messages from login form
    }
    logAction('INFO', `Displayed ${formToShow} form.`);
}

/**
 * Toggles the overall visibility between the authentication section and the main application content.
 * @param {boolean} isAuthenticated - True if a user is currently logged in, false otherwise.
 */
function toggleAppVisibility(isAuthenticated) {
    logAction('INFO', `Toggling main app visibility. Is Authenticated: ${isAuthenticated}`);
    if (isAuthenticated) {
        authSection.classList.add('hidden'); // Hide the authentication forms
        mainAppContent.classList.remove('hidden'); // Show the main application content
        logAction('INFO', 'Main application content is now visible.');
    } else {
        authSection.classList.remove('hidden'); // Show the authentication forms
        mainAppContent.classList.add('hidden'); // Hide the main application content
        userEmailDisplay.textContent = ''; // Clear the displayed user email
        // Also hide all role-specific sections when logging out
        adminSection.classList.add('hidden');
        driverSection.classList.add('hidden');
        userSection.classList.add('hidden');
        currentUserRole = null; // Clear the stored user role
        logAction('INFO', 'User logged out, UI reset to authentication view.');
    }
}

/**
 * Dynamically displays or hides sections of the application based on the user's assigned role.
 * @param {string} role - The role of the currently logged-in user ('user', 'driver', 'admin').
 */
function displayContentByRole(role) {
    logAction('INFO', `Adjusting content visibility for role: ${role}`);
    // Start by hiding all role-specific sections
    adminSection.classList.add('hidden');
    driverSection.classList.add('hidden');
    userSection.classList.add('hidden');

    // Show sections based on the determined role
    if (role === 'admin') {
        adminSection.classList.remove('hidden'); // Admin sees admin panel
        driverSection.classList.remove('hidden'); // Admin can also access driver functions
        userSection.classList.remove('hidden'); // Admin can also access user functions
        logAction('INFO', 'Admin sections displayed.');
    } else if (role === 'driver') {
        driverSection.classList.remove('hidden'); // Driver sees driver functions
        userSection.classList.remove('hidden'); // Driver can also access user functions
        logAction('INFO', 'Driver sections displayed.');
    } else if (role === 'user') {
        userSection.classList.remove('hidden'); // Regular user sees only user functions
        logAction('INFO', 'User sections displayed.');
    } else {
        logAction('WARN', `Unknown role encountered: ${role}. No specific sections displayed.`);
    }
}

// Event listeners for switching between login and registration forms
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the default action of the anchor tag (page reload)
    showAuthForm('login');
    logAction('INFO', 'User clicked "Login here" link to switch forms.');
});

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the default action of the anchor tag
    showAuthForm('register');
    logAction('INFO', 'User clicked "Register here" link to switch forms.');
});

// =============================================================================
// Firebase Authentication & Firestore User Profile Logic
// =============================================================================

/**
 * Handles user registration with Firebase Authentication and stores user profile (including role) in Firestore.
 * @param {string} email - The email address for the new user.
 * @param {string} password - The password for the new user.
 * @param {string} role - The role to assign to the new user ('user', 'driver', 'admin').
 * @param {HTMLElement} messageElement - The HTML element where success/error messages will be displayed.
 * @returns {Promise<void>}
 */
async function registerUserWithRole(email, password, role, messageElement) {
    messageElement.textContent = ''; // Clear any previous messages

    // Basic client-side validation for password length
    if (password.length < 6) {
        messageElement.textContent = 'Password should be at least 6 characters.';
        messageElement.style.color = 'red';
        logAction('WARN', 'Registration attempt failed: Password too short.', { email: email, role: role });
        return; // Stop the function if validation fails
    }

    logAction('INFO', `Attempting to register user with role: ${role}.`, { email: email });
    try {
        // Create user in Firebase Authentication
        const userCredential = await window.createUserWithEmailAndPassword(window.auth, email, password);
        const user = userCredential.user; // Get the user object from the credential

        // Store user profile (including role) in Firestore
        // The document ID in the 'users' collection will be the user's unique UID from Firebase Auth
        await window.setDoc(window.doc(window.db, 'users', user.uid), {
            email: user.email,
            role: role,
            createdAt: window.serverTimestamp() // Use Firestore's server timestamp
        });

        logAction('INFO', `User registered and profile saved to Firestore.`, { email: user.email, uid: user.uid, role: role });
        messageElement.textContent = `Registration successful! User ${user.email} created as ${role}.`;
        messageElement.style.color = 'green';

        // Note: onAuthStateChanged listener will automatically handle UI updates after successful registration/login
    } catch (error) {
        logAction('ERROR', 'User registration failed.', { email: email, role: role, error: error.message });
        messageElement.textContent = `Registration failed: ${error.message}`;
        messageElement.style.color = 'red';
    }
}

// Event listener for the main "Register" button (for regular users, assigns 'user' role)
registerButton.addEventListener('click', async () => {
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;
    logAction('INFO', 'User initiated registration for a "user" role.');
    await registerUserWithRole(email, password, 'user', registerMessage);
});

// Event listener for the "Register Driver" button in the Admin Panel (assigns 'driver' role)
adminRegisterDriverButton.addEventListener('click', async () => {
    // In a production app, you'd add a robust server-side check here to ensure
    // that only authenticated 'admin' users can trigger this action.
    // For this client-side example, we rely on the UI being hidden from non-admins.
    const email = adminRegisterEmailInput.value;
    const password = adminRegisterPasswordInput.value;
    logAction('INFO', 'Admin initiated registration for a "driver" role.', { adminEmail: window.auth.currentUser.email, driverEmail: email });
    await registerUserWithRole(email, password, 'driver', adminRegisterMessage);
    adminRegisterEmailInput.value = ''; // Clear input fields after submission
    adminRegisterPasswordInput.value = '';
});


/**
 * Handles user login with Firebase Authentication and fetches their role from Firestore.
 */
loginButton.addEventListener('click', async () => {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    loginMessage.textContent = ''; // Clear any previous messages
    logAction('INFO', 'Attempting user login.', { email: email });

    try {
        // Sign in user with Firebase Authentication
        const userCredential = await window.signInWithEmailAndPassword(window.auth, email, password);
        const user = userCredential.user;

        // Fetch the user's role from their Firestore profile document
        const userDocRef = window.doc(window.db, 'users', user.uid);
        const userDocSnap = await window.getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            currentUserRole = userData.role; // Store the fetched role
            logAction('INFO', `User logged in successfully with role: ${currentUserRole}.`, { email: user.email, uid: user.uid, role: currentUserRole });
            loginMessage.textContent = `Login successful! Welcome, ${user.email} (${currentUserRole}).`;
            loginMessage.style.color = 'green';
            // onAuthStateChanged listener will handle the UI update based on currentUserRole
        } else {
            // This scenario means a user exists in Firebase Auth but has no profile in Firestore.
            // This shouldn't happen if registration is always handled by registerUserWithRole.
            logAction('WARN', `User profile not found in Firestore for logged-in user. Defaulting to 'user' role.`, { email: user.email, uid: user.uid });
            currentUserRole = 'user'; // Assign a default role if profile is missing
            loginMessage.textContent = `Login successful, but profile missing. Defaulting to 'user' role.`;
            loginMessage.style.color = 'orange';
        }
    } catch (error) {
        logAction('ERROR', 'User login failed.', { email: email, error: error.message });
        loginMessage.textContent = `Login failed: ${error.message}`;
        loginMessage.style.color = 'red';
        currentUserRole = null; // Clear role on failed login attempt
    }
});

// Event listener for the Logout button
logoutButton.addEventListener('click', async () => {
    logAction('INFO', 'User initiated logout.');
    try {
        // Sign out user from Firebase Authentication
        await window.signOut(window.auth);
        logAction('INFO', 'User logged out successfully.');
        // onAuthStateChanged listener will handle the UI update
    }
    catch (error) {
        logAction('ERROR', 'Logout failed.', { error: error.message });
        alert(`Logout failed: ${error.message}`);
    }
});

// Firebase Authentication State Observer
// This is a crucial listener that reacts to changes in the user's authentication state (login, logout, page refresh).
window.addEventListener('firebaseReady', () => {
    logAction('INFO', 'Firebase ready event received. Setting up Firebase Auth state observer.');
    window.onAuthStateChanged(window.auth, async (user) => {
        if (user) {
            // User is signed in (logged in)
            logAction('INFO', 'Auth state changed: User is signed in.', { email: user.email, uid: user.uid });

            // Fetch the user's role from Firestore when the auth state changes
            const userDocRef = window.doc(window.db, 'users', user.uid);
            const userDocSnap = await window.getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                currentUserRole = userData.role; // Update the global role variable
                userEmailDisplay.textContent = `Logged in as: ${user.email} (${currentUserRole})`;
                logAction('INFO', `User role fetched from Firestore during auth state change.`, { email: user.email, role: currentUserRole });
            } else {
                // Fallback: If user exists in Auth but not Firestore profile, assign default 'user' role
                logAction('WARN', `User profile not found for ${user.email} during auth state change. Defaulting to 'user' role.`, { uid: user.uid });
                currentUserRole = 'user';
                userEmailDisplay.textContent = `Logged in as: ${user.email} (user - profile missing!)`;
            }

            toggleAppVisibility(true); // Show the main application content
            displayContentByRole(currentUserRole); // Show/hide specific sections based on role
            fetchAndDisplayBuses(); // Refresh and display bus information
        } else {
            // User is signed out
            logAction('INFO', 'Auth state changed: User is signed out.');
            toggleAppVisibility(false); // Show the authentication section
            showAuthForm('login'); // Default to showing the login form
            currentUserRole = null; // Clear the current user's role
        }
    });

    logAction('INFO', 'Ebus Management System script initialized and Firebase Auth observer set up.');
});

// Fallback check for initial load. This ensures that if the Firebase objects
// are somehow already available before the 'firebaseReady' event fires,
// the auth state observer is still effectively triggered.
if (window.db && window.collection && window.getDocs && window.auth) {
    logAction('INFO', 'Firebase objects detected on initial load (fallback). Auth state observer should handle UI.');
} else {
    logAction('INFO', 'Waiting for Firebase to be ready (initial load check).');
}


// =============================================================================
// Function to Fetch and Display Buses from Firestore (Existing Code - Updated for search)
// =============================================================================

/**
 * Fetches and displays bus information from Firestore, optionally filtered by source and destination.
 * @param {string} [sourceFilter=''] - Optional source string to filter by.
 * @param {string} [destinationFilter=''] - Optional destination string to filter by.
 */
async function fetchAndDisplayBuses(sourceFilter = '', destinationFilter = '') {
    logAction('INFO', `Initiating fetch and display of buses. Filters: Source="${sourceFilter}", Destination="${destinationFilter}"`);
    busInfoDisplay.innerHTML = '<p style="font-size: 1.1em; color: #555;">Loading bus information...</p>';

    try {
        let busesRef = window.collection(window.db, 'buses');
        let q = window.query(busesRef, window.orderBy('timestamp', 'desc'));

        if (sourceFilter.trim() !== '' || destinationFilter.trim() !== '') {
            logAction('WARN', "Client-side filtering for bus routes. Firestore does not support 'contains' queries directly for substrings.", { source: sourceFilter, destination: destinationFilter });
        }

        const querySnapshot = await window.getDocs(q);

        let busesHtml = '<h3>Available Buses:</h3>';
        let filteredBuses = [];

        if (querySnapshot.empty) {
            logAction('INFO', 'No bus documents found in Firestore collection.');
            busesHtml += '<p style="font-size: 1.1em; color: #555;">No bus information available yet. Post one above!</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const bus = doc.data();
                const routeLower = bus.busRoute ? bus.busRoute.toLowerCase() : ''; // Ensure busRoute exists
                const sourceLower = sourceFilter.toLowerCase();
                const destLower = destinationFilter.toLowerCase();

                const matchesSource = sourceFilter.trim() === '' || routeLower.includes(sourceLower);
                const matchesDestination = destinationFilter.trim() === '' || routeLower.includes(destLower);

                if (matchesSource && matchesDestination) {
                    filteredBuses.push(bus);
                }
            });

            if (filteredBuses.length === 0) {
                logAction('INFO', 'No buses found matching current search criteria after client-side filtering.', { source: sourceFilter, destination: destinationFilter });
                busesHtml += '<p style="font-size: 1.1em; color: #555;">No buses found matching your search criteria.</p>';
            } else {
                logAction('INFO', `Successfully filtered ${filteredBuses.length} buses matching criteria.`, { source: sourceFilter, destination: destinationFilter });
                filteredBuses.forEach(bus => {
                    busesHtml += `
                        <div class="bus-card">
                            <p><strong>Bus No:</strong> ${bus.busNumber}</p>
                            <p><strong>Route:</strong> ${bus.busRoute}</p>
                            <p><strong>Bus Type:</strong> ${bus.busType || 'N/A'}</p>
                            <p><strong>Contact:</strong> ${bus.contactInfo || 'N/A'}</p>
                            <p><small>Posted by: ${bus.postedBy || 'Unknown'} on ${bus.timestamp ? new Date(bus.timestamp.toDate()).toLocaleString() : 'N/A'}</small></p>
                        </div>
                    `;
                });
            }
        }
        busInfoDisplay.innerHTML = busesHtml;
    } catch (error) {
        logAction('ERROR', 'Error during bus data fetch or display.', { error: error.message });
        busInfoDisplay.innerHTML = '<p style="color: red; font-size: 1.1em;">Error loading bus information. Please check your console.</p>';
    }
}

// =============================================================================
// Event Listener for "Post Bus Information" Button (Existing Code)
// =============================================================================

postBusInfoButton.addEventListener('click', async function() {
    if (!window.auth.currentUser) {
        alert('Please log in to post bus information.');
        logAction('WARN', 'Post attempt blocked: User not logged in.');
        return;
    }
    if (currentUserRole !== 'driver' && currentUserRole !== 'admin') {
        alert('Only users with a "driver" or "admin" role can post bus information.');
        logAction('WARN', `Post attempt blocked: Insufficient role (${currentUserRole}).`);
        return;
    }

    const busNumber = busNumberInput.value;
    const busRoute = busRouteInput.value;
    const busType = busTypeInput.value;
    const contactInfo = contactInfoInput.value;

    if (busNumber.trim() === '' || busRoute.trim() === '' || busType.trim() === '' || contactInfo.trim() === '') {
        alert('Please fill in all bus information fields (Bus Number, Route, Type, Contact)!');
        logAction('WARN', 'Post attempt blocked: Missing required fields.');
        return;
    }

    logAction('INFO', 'Attempting to post new bus information to Firebase Firestore.', { busNumber: busNumber, busRoute: busRoute, postedBy: window.auth.currentUser.email });

    try {
        const docRef = await window.addDoc(window.collection(window.db, 'buses'), {
            busNumber: busNumber,
            busRoute: busRoute,
            busType: busType,
            contactInfo: contactInfo,
            timestamp: window.serverTimestamp(),
            postedBy: window.auth.currentUser.email,
            postedByUid: window.auth.currentUser.uid
        });

        logAction('INFO', "New bus document successfully written to Firestore.", { docId: docRef.id, busNumber: busNumber });

        // Clear all input fields after successful submission
        busNumberInput.value = '';
        busRouteInput.value = '';
        busTypeInput.value = '';
        contactInfoInput.value = '';

        // Refresh the display with current search filters (if any)
        fetchAndDisplayBuses(searchSourceInput.value, searchDestinationInput.value);
    } catch (error) {
        logAction('ERROR', "Error writing bus document to Firestore.", { error: error.message, busNumber: busNumber });
        alert("Error posting bus information. Please check the browser console for details.");
    }
});

// =============================================================================
// Event Listeners for Search Functionality
// =============================================================================

searchButton.addEventListener('click', () => {
    const source = searchSourceInput.value;
    const destination = searchDestinationInput.value;
    logAction('INFO', 'User clicked Search button.', { source: source, destination: destination });
    fetchAndDisplayBuses(source, destination);
});

clearSearchButton.addEventListener('click', () => {
    logAction('INFO', 'User clicked Clear Search button.');
    searchSourceInput.value = '';
    searchDestinationInput.value = '';
    fetchAndDisplayBuses(); // Call without filters to show all buses
});
