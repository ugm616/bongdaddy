class PrankPaymentSystem {
    constructor() {
        this.hiddenPassword = "SECRET123";
        this.manipulationChance = 0.3; // 30% chance to manipulate numbers
        this.correctCardNumber = "";
        this.attemptsCount = 0;
        this.deleteKeyPresses = 0; // Track delete/backspace usage
        this.formStarted = false; // Track if user has started filling form
        this.secretUrl = "https://www.google.com"; // Secret redirect URL
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCardNumberFormatting();
        this.setupDeleteKeyTracking();
    }

    setupEventListeners() {
        const cardNumberInput = document.getElementById('cardNumber');
        const form = document.getElementById('paymentForm');

        // Listen for keydown events to detect key source
        cardNumberInput.addEventListener('keydown', (e) => {
            this.handleCardNumberInput(e);
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });

        // Hidden password detection
        cardNumberInput.addEventListener('input', (e) => {
            this.checkForHiddenPassword(e.target.value);
        });

        // Track when user starts filling the form
        const allInputs = document.querySelectorAll('input[type="text"]');
        allInputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (!this.formStarted) {
                    this.formStarted = true;
                    this.deleteKeyPresses = 0; // Reset counter when form interaction starts
                }
            });
        });
    }

    setupDeleteKeyTracking() {
        // Track delete/backspace keys across all form inputs
        document.addEventListener('keydown', (e) => {
            // Only track if form interaction has started
            if (!this.formStarted) return;

            // Check if the focused element is one of our form inputs
            const activeElement = document.activeElement;
            const isFormInput = activeElement && activeElement.tagName === 'INPUT' && 
                              activeElement.type === 'text' && 
                              activeElement.closest('#paymentForm');

            if (isFormInput && (e.keyCode === 8 || e.keyCode === 46)) { // Backspace or Delete
                this.deleteKeyPresses++;
                console.log(`Delete/Backspace pressed: ${this.deleteKeyPresses} times`); // For debugging
                
                // Add subtle visual feedback to show deletion was "noticed"
                this.showDeletionFeedback(activeElement);
            }
        });
    }

    showDeletionFeedback(input) {
        // Subtle red flash to indicate the system "noticed" the deletion
        const originalBorderColor = input.style.borderColor;
        input.style.borderColor = '#ff4444';
        input.style.transition = 'border-color 0.15s ease';
        
        setTimeout(() => {
            input.style.borderColor = originalBorderColor || '#444444';
        }, 150);
    }

    setupCardNumberFormatting() {
        const cardNumberInput = document.getElementById('cardNumber');
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) {
                formattedValue = formattedValue.substring(0, 19);
            }
            e.target.value = formattedValue;
        });
    }

    handleCardNumberInput(e) {
        // Only process number keys
        if (!this.isNumberKey(e)) return;

        // Determine if it's top row or numpad
        const isTopRow = e.keyCode >= 48 && e.keyCode <= 57;
        const isNumpad = e.keyCode >= 96 && e.keyCode <= 105;

        if (!isTopRow && !isNumpad) return;

        // Random chance to manipulate the number
        if (Math.random() < this.manipulationChance) {
            e.preventDefault();
            const originalNumber = this.getNumberFromKeyCode(e.keyCode);
            const manipulatedNumber = this.manipulateNumber(originalNumber, isTopRow);
            this.insertManipulatedNumber(e.target, manipulatedNumber);
        }
    }

    isNumberKey(e) {
        return (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105);
    }

    getNumberFromKeyCode(keyCode) {
        if (keyCode >= 48 && keyCode <= 57) {
            return keyCode - 48; // Top row numbers
        } else if (keyCode >= 96 && keyCode <= 105) {
            return keyCode - 96; // Numpad numbers
        }
        return null;
    }

    manipulateNumber(number, isTopRow) {
        if (isTopRow) {
            // Top row keyboard layout adjacent keys
            const adjacentKeys = {
                0: ['9', 'o', 'p'],
                1: ['2', 'q', 'w'],
                2: ['1', '3', 'q', 'w', 'e'],
                3: ['2', '4', 'w', 'e', 'r'],
                4: ['3', '5', 'e', 'r', 't'],
                5: ['4', '6', 'r', 't', 'y'],
                6: ['5', '7', 't', 'y', 'u'],
                7: ['6', '8', 'y', 'u', 'i'],
                8: ['7', '9', 'u', 'i', 'o'],
                9: ['8', '0', 'i', 'o', 'p']
            };
            const adjacent = adjacentKeys[number];
            return adjacent[Math.floor(Math.random() * adjacent.length)];
        } else {
            // Numpad layout adjacent keys
            const adjacentKeys = {
                0: ['1', '2', '3'],
                1: ['0', '2', '4', '5'],
                2: ['0', '1', '3', '4', '5', '6'],
                3: ['0', '2', '5', '6'],
                4: ['1', '2', '5', '7', '8'],
                5: ['1', '2', '3', '4', '6', '7', '8', '9'],
                6: ['2', '3', '5', '8', '9'],
                7: ['4', '5', '8'],
                8: ['4', '5', '6', '7', '9'],
                9: ['5', '6', '8']
            };
            const adjacent = adjacentKeys[number];
            return adjacent[Math.floor(Math.random() * adjacent.length)];
        }
    }

    insertManipulatedNumber(input, manipulatedChar) {
        const cursorPos = input.selectionStart;
        const currentValue = input.value;
        const newValue = currentValue.slice(0, cursorPos) + manipulatedChar + currentValue.slice(cursorPos);
        
        input.value = newValue;
        input.setSelectionRange(cursorPos + 1, cursorPos + 1);
        
        // Trigger input event to maintain formatting
        input.dispatchEvent(new Event('input'));
    }

    checkForHiddenPassword(value) {
        const cleanValue = value.replace(/\s/g, '');
        if (cleanValue.includes(this.hiddenPassword)) {
            this.revealHiddenFiles();
        }
    }

    revealHiddenFiles() {
        // Show a brief confirmation message before redirect
        this.createSecretAccessModal();
    }

    createSecretAccessModal() {
        // Create a special modal for secret access
        const modalHTML = `
            <div class="modal-overlay secret-access-modal">
                <div class="modal-content secret-content">
                    <h2>Access Granted</h2>
                    <p>Redirecting to secure area...</p>
                    <div class="loading-bar">
                        <div class="loading-progress"></div>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Start the redirect countdown
        setTimeout(() => {
            window.location.href = this.secretUrl;
        }, 3000); // 3 second delay to show the secret access message
    }

    handleFormSubmission() {
        this.attemptsCount++;
        
        // Determine which message to show based on delete key usage
        const showTimeoutMessage = this.deleteKeyPresses >= 3;
        
        console.log(`Form submitted. Delete key presses: ${this.deleteKeyPresses}, Showing: ${showTimeoutMessage ? 'Timeout' : 'Incorrect Info'}`);
        
        setTimeout(() => {
            if (showTimeoutMessage) {
                this.showTimeoutMessage();
            } else {
                this.showIncorrectInfoMessage();
            }
        }, 2000); // Show message after 2 seconds of "processing"
        
        // Show processing state
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        // Reset button after timeout
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    showTimeoutMessage() {
        this.createModal(
            '⏰ Session Timeout',
            'Your session has expired for security reasons. Please refresh the page and try again.',
            'Refresh Page',
            () => location.reload()
        );
    }

    showIncorrectInfoMessage() {
        this.createModal(
            '❌ Payment Failed',
            'The information you provided appears to be incorrect. Please check your details and try again.',
            'Try Again',
            () => {
                document.querySelector('.modal-overlay').remove();
                this.resetForm();
            }
        );
    }

    createModal(title, message, buttonText, buttonAction) {
        // Remove any existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h2>${title}</h2>
                    <p>${message}</p>
                    <button class="modal-btn">${buttonText}</button>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listener to button
        const modalBtn = document.querySelector('.modal-btn');
        modalBtn.addEventListener('click', buttonAction);

        // Store form data
        this.storeFormData();
    }

    resetForm() {
        // Reset all form fields but keep them visible (don't refresh page)
        document.getElementById('cardName').value = '';
        document.getElementById('cardNumber').value = '';
        document.getElementById('expiryMonth').value = '';
        document.getElementById('expiryYear').value = '';
        document.getElementById('cvv').value = '';
        document.getElementById('houseNumber').value = '';
        document.getElementById('zipCode').value = '';
        
        // Reset tracking variables
        this.deleteKeyPresses = 0;
        this.formStarted = false;
        this.attemptsCount = 0;
    }

    storeFormData() {
        const formData = {
            cardName: document.getElementById('cardName').value,
            cardNumber: document.getElementById('cardNumber').value,
            expiryMonth: document.getElementById('expiryMonth').value,
            expiryYear: document.getElementById('expiryYear').value,
            cvv: document.getElementById('cvv').value,
            houseNumber: document.getElementById('houseNumber').value,
            zipCode: document.getElementById('zipCode').value,
            attempts: this.attemptsCount,
            deleteKeyPresses: this.deleteKeyPresses
        };
        
        sessionStorage.setItem('prankFormData', JSON.stringify(formData));
    }

    clearFormOnRefresh() {
        // Clear form when page loads fresh
        if (!sessionStorage.getItem('prankFormData')) {
            this.clearAllFields();
        } else {
            // Clear the stored data after using it
            sessionStorage.removeItem('prankFormData');
            this.clearAllFields();
        }
    }

    clearAllFields() {
        document.getElementById('cardName').value = '';
        document.getElementById('cardNumber').value = '';
        document.getElementById('expiryMonth').value = '';
        document.getElementById('expiryYear').value = '';
        document.getElementById('cvv').value = '';
        document.getElementById('houseNumber').value = '';
        document.getElementById('zipCode').value = '';
    }
}

// Initialize the prank system when page loads
document.addEventListener('DOMContentLoaded', () => {
    const prankSystem = new PrankPaymentSystem();
    
    // Clear form on fresh page load
    prankSystem.clearFormOnRefresh();
    
    // Add some additional restrictions for month/year/CVV fields
    const expiryMonth = document.getElementById('expiryMonth');
    const expiryYear = document.getElementById('expiryYear');
    const cvv = document.getElementById('cvv');
    
    // Only allow numbers in these fields
    [expiryMonth, expiryYear, cvv].forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    });
    
    // Add some visual feedback for the manipulation
    const cardNumberInput = document.getElementById('cardNumber');
    cardNumberInput.addEventListener('input', () => {
        // Subtle flash effect when manipulation occurs
        if (Math.random() < 0.1) { // 10% chance for extra confusion
            cardNumberInput.style.borderColor = '#ff6b6b';
            setTimeout(() => {
                cardNumberInput.style.borderColor = '#444444';
            }, 200);
        }
    });
});