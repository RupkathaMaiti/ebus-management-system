
// =============================================================================
// Get References to HTML Elements
// These elements are part of the DOM and can be referenced immediately when the script loads.
// They do not depend on Firebase initialization.
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

// NEW: General message display for alerts (e.g., logout errors, post errors)
// This element needs to be added to your index.html as well, inside mainAppContent
const generalMessageDisplay = document.getElementById('generalMessageDisplay');


// Global variable to store current user's role
let currentUserRole = null;

// =============================================================================
// Logging Function
// This function does not depend on Firebase, so it can be defined globally.
// =============================================================================

/**
 * Centralized logging function for application actions.
 * @param {string} level - The severity level of the log (e.g., 'INFO', 'WARN', 'ERROR').
 * @param {string} message - A descriptive message for the log entry.
 * @param {object} [data={}] - Optional, additional data relevant to the log entry.
 */
function logAction(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp: timestamp,
        level: level,
        message: message,
        data: data
    };

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
// These functions primarily interact with the DOM and do not directly depend on Firebase.
// =============================================================================

/**
 * Controls the visibility of the login and registration forms.
 * @param {string} formToShow - Specifies which form to display ('login' or 'register').
 */
function showAuthForm(formToShow) {
    logAction('INFO', `Attempting to show ${formToShow} form.`);
    if (formToShow === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        registerMessage.textContent = '';
    } else { // 'register'
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        loginMessage.textContent = '';
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
        authSection.classList.add('hidden');
        mainAppContent.classList.remove('hidden');
        logAction('INFO', 'Main application content is now visible.');
    } else {
        authSection.classList.remove('hidden');
        mainAppContent.classList.add('hidden');
        userEmailDisplay.textContent = '';
        adminSection.classList.add('hidden');
        driverSection.classList.add('hidden');
        userSection.classList.add('hidden');
        currentUserRole = null;
        logAction('INFO', 'User logged out, UI reset to authentication view.');
    }
    // Clear general messages on visibility change
    if (generalMessageDisplay) {
        generalMessageDisplay.textContent = '';
    }
}

/**
 * Dynamically displays or hides sections of the application based on the user's assigned role.
 * @param {string} role - The role of the currently logged-in user ('user', 'driver', 'admin').
 */
function displayContentByRole(role) {
    logAction('INFO', `Adjusting content visibility for role: ${role}`);
    adminSection.classList.add('hidden');
    driverSection.classList.add('hidden');
    userSection.classList.add('hidden');

    if (role === 'admin') {
        adminSection.classList.remove('hidden');
        driverSection.classList.remove('hidden');
        userSection.classList.remove('hidden');
        logAction('INFO', 'Admin sections displayed.');
    } else if (role === 'driver') {
        driverSection.classList.remove('hidden');
        userSection.classList.remove('hidden');
        logAction('INFO', 'Driver sections displayed.');
    } else if (role === 'user') {
        userSection.classList.remove('hidden');
        logAction('INFO', 'User sections displayed.');
    } else {
        logAction('WARN', `Unknown role encountered: ${role}. No specific sections displayed.`);
    }
}

// Event listeners for switching between login and registration forms
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showAuthForm('login');
    logAction('INFO', 'User clicked "Login here" link to switch forms.');
});

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showAuthForm('register');
    logAction('INFO', 'User clicked "Register here" link to switch forms.');
});


// =============================================================================
// ALL FIREBASE-DEPENDENT LOGIC STARTS HERE
// This entire block of code will only execute AFTER the 'firebaseReady' event
// is dispatched from index.html, ensuring all Firebase services (window.auth, window.db etc.)
// are fully initialized and available.
// =============================================================================
window.addEventListener('firebaseReady', () => {
    logAction('INFO', 'Firebase ready event received. Setting up Firebase Auth state observer and app logic.');

    // =============================================================================
    // Function to Fetch and Display Buses from Firestore
    // This function is defined here so it's accessible to other parts of the script
    // that also run after 'firebaseReady'.
    // =============================================================================

    /**
     * Fetches and displays bus information from Firestore, optionally filtered by source and destination.
     * @param {string} [sourceFilter=''] - Optional source string to filter by.
     * @param {string} [destinationFilter=''] - Optional destination string to filter by.
     */
    async function fetchAndDisplayBuses(sourceFilter = '', destinationFilter = '') {
        logAction('INFO', `Initiating fetch and display of buses. Filters: Source="${sourceFilter}", Destination="${destinationFilter}"`);
        busInfoDisplay.innerHTML = '<p style="font-size: 1.1em; color: #555;">Loading bus information...</p>';
        if (generalMessageDisplay) generalMessageDisplay.textContent = ''; // Clear general messages

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
            return;
        }

        logAction('INFO', `Attempting to register user with role: ${role}.`, { email: email });
        try {
            const userCredential = await window.createUserWithEmailAndPassword(window.auth, email, password);
            const user = userCredential.user;

            await window.setDoc(window.doc(window.db, 'users', user.uid), {
                email: user.email,
                role: role,
                createdAt: window.serverTimestamp()
            });

            logAction('INFO', `User registered and profile saved to Firestore.`, { email: user.email, uid: user.uid, role: role });
            messageElement.textContent = `Registration successful! User ${user.email} created as ${role}.`;
            messageElement.style.color = 'green';
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
        const email = adminRegisterEmailInput.value;
        const password = adminRegisterPasswordInput.value;
        logAction('INFO', 'Admin initiated registration for a "driver" role.', { adminEmail: window.auth.currentUser.email, driverEmail: email });
        await registerUserWithRole(email, password, 'driver', adminRegisterMessage);
        adminRegisterEmailInput.value = '';
        adminRegisterPasswordInput.value = '';
    });


    /**
     * Handles user login with Firebase Authentication and fetches their role from Firestore.
     */
    loginButton.addEventListener('click', async () => {
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;
        loginMessage.textContent = '';
        logAction('INFO', 'Attempting user login.', { email: email });

        try {
            const userCredential = await window.signInWithEmailAndPassword(window.auth, email, password);
            const user = userCredential.user;

            const userDocRef = window.doc(window.db, 'users', user.uid);
            const userDocSnap = await window.getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                currentUserRole = userData.role;
                logAction('INFO', `User logged in successfully with role: ${currentUserRole}.`, { email: user.email, uid: user.uid, role: currentUserRole });
                loginMessage.textContent = `Login successful! Welcome, ${user.email} (${currentUserRole}).`;
                loginMessage.style.color = 'green';
            } else {
                logAction('WARN', `User profile not found in Firestore for logged-in user. Defaulting to 'user' role.`, { email: user.email, uid: user.uid });
                currentUserRole = 'user';
                loginMessage.textContent = `Login successful, but profile missing. Defaulting to 'user' role.`;
                loginMessage.style.color = 'orange';
            }
        } catch (error) {
            logAction('ERROR', 'User login failed.', { email: email, error: error.message });
            loginMessage.textContent = `Login failed: ${error.message}`;
            loginMessage.style.color = 'red';
            currentUserRole = null;
        }
    });

    // Event listener for the Logout button
    logoutButton.addEventListener('click', async () => {
        logAction('INFO', 'User initiated logout.');
        if (generalMessageDisplay) generalMessageDisplay.textContent = '';
        try {
            await window.signOut(window.auth);
            logAction('INFO', 'User logged out successfully.');
            if (generalMessageDisplay) {
                generalMessageDisplay.textContent = 'Logged out successfully.';
                generalMessageDisplay.style.color = 'green';
            }
        } catch (error) {
            logAction('ERROR', 'Logout failed.', { error: error.message });
            if (generalMessageDisplay) {
                generalMessageDisplay.textContent = `Logout failed: ${error.message}`;
                generalMessageDisplay.style.color = 'red';
            }
        }
    });

    // Firebase Authentication State Observer
    // This is a crucial listener that reacts to changes in the user's authentication state (login, logout, page refresh).
    window.onAuthStateChanged(window.auth, async (user) => {
        if (user) {
            logAction('INFO', 'Auth state changed: User is signed in.', { email: user.email, uid: user.uid });
            if (generalMessageDisplay) generalMessageDisplay.textContent = ''; // Clear general messages on successful login

            const userDocRef = window.doc(window.db, 'users', user.uid);
            const userDocSnap = await window.getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                currentUserRole = userData.role;
                userEmailDisplay.textContent = `Logged in as: ${user.email} (${currentUserRole})`;
                logAction('INFO', `User role fetched from Firestore during auth state change.`, { email: user.email, role: currentUserRole });
            } else {
                logAction('WARN', `User profile not found for ${user.email} during auth state change. Defaulting to 'user' role.`, { uid: user.uid });
                currentUserRole = 'user';
                userEmailDisplay.textContent = `Logged in as: ${user.email} (user - profile missing!)`;
            }

            toggleAppVisibility(true);
            displayContentByRole(currentUserRole);
            fetchAndDisplayBuses(); // Initial fetch on login/page load
        } else {
            logAction('INFO', 'Auth state changed: User is signed out.');
            toggleAppVisibility(false);
            showAuthForm('login');
            currentUserRole = null;
        }
    });

    // =============================================================================
    // Event Listener for "Post Bus Information" Button
    // =============================================================================

    postBusInfoButton.addEventListener('click', async function() {
        if (generalMessageDisplay) generalMessageDisplay.textContent = '';

        if (!window.auth.currentUser) {
            if (generalMessageDisplay) {
                generalMessageDisplay.textContent = 'Please log in to post bus information.';
                generalMessageDisplay.style.color = 'red';
            }
            logAction('WARN', 'Post attempt blocked: User not logged in.');
            return;
        }
        if (currentUserRole !== 'driver' && currentUserRole !== 'admin') {
            if (generalMessageDisplay) {
                generalMessageDisplay.textContent = 'Only users with a "driver" or "admin" role can post bus information.';
                generalMessageDisplay.style.color = 'red';
            }
            logAction('WARN', `Post attempt blocked: Insufficient role (${currentUserRole}).`);
            return;
        }

        const busNumber = busNumberInput.value;
        const busRoute = busRouteInput.value;
        const busType = busTypeInput.value;
        const contactInfo = contactInfoInput.value;

        if (busNumber.trim() === '' || busRoute.trim() === '' || busType.trim() === '' || contactInfo.trim() === '') {
            if (generalMessageDisplay) {
                generalMessageDisplay.textContent = 'Please fill in all bus information fields (Bus Number, Route, Type, Contact)!';
                generalMessageDisplay.style.color = 'red';
            }
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
            if (generalMessageDisplay) {
                generalMessageDisplay.textContent = 'Bus information posted successfully!';
                generalMessageDisplay.style.color = 'green';
            }

            busNumberInput.value = '';
            busRouteInput.value = '';
            busTypeInput.value = '';
            contactInfoInput.value = '';

            fetchAndDisplayBuses(searchSourceInput.value, searchDestinationInput.value);
        } catch (error) {
            logAction('ERROR', "Error writing bus document to Firestore.", { error: error.message, busNumber: busNumber });
            if (generalMessageDisplay) {
                generalMessageDisplay.textContent = `Error posting bus information: ${error.message}`;
                generalMessageDisplay.style.color = 'red';
            }
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

    logAction('INFO', 'Ebus Management System script initialized and all main event listeners set up.');

}); // End of firebaseReady event listener

