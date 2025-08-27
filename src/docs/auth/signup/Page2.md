# Register - Step2 (Email Verification) Documentation

Step2 handles **email verification** in the Admin registration flow.  
It validates the email, sends OTP to the user’s email, manages OTP entry, verifies OTP, and progresses to the next step.

## Features

- Email input with regex validation
- OTP request & verification (via MSG91 SDK)
- 6-digit OTP input fields with auto-focus + backspace handling
- OTP resend option with timer (30s cooldown)
- Reset OTP input (refresh icon)
- LocalStorage persistence (temp_access_token)
- Progression to next registration step upon success
- Error + success notifications via toast
- Back button support
- Loading state during API calls

## Data Flow

Local State:
- email → entered email address
- error → email validation error
- otpVisible → toggles OTP input visibility
- otp → array [“”, “”, …] for 6-digit code
- timer → countdown for resend (default 30s)
- isResendDisabled → disables resend until timer ends

Refs:
- inputRefs → refs for OTP inputs (auto-focus navigation)

Redux (appAuth):
- status → registration status (emailVerified, etc.)
- emailOtpReqId → OTP request session ID

LocalStorage:
- temp_access_token → temporary token returned after email verification

## Main Flow

1. User enters email → click Continue
   - Validate email format with regex
   - Call window.sendOtp
   - Save email & OTP request ID in Redux
   - Show OTP input fields
   - Start 30s resend timer

2. User enters OTP
   - Auto-focus moves between inputs
   - Backspace navigation supported
   - Reset button clears all digits

3. Verify OTP
   - Call window.verifyOtp
   - On success:
     - Save temp_access_token in localStorage
     - Dispatch emailVerified to Redux
     - Move to next step (Step 3: Update Password)
   - On error → show toast error

4. Resend OTP
   - Enabled only after 30s cooldown
   - Calls window.retryOtp with type "3" (EMAIL)
   - Refreshes timer & resets OTP input

## API Endpoints

- POST /admin/email-token-verify → verify email + OTP token


## Behaviour

- Success:
  - "OTP sent successfully"
  - "Email verified successfully"
- Error:
  - Invalid email → error message below input
  - Wrong OTP → toast error
- Navigation:
  - Back button → calls goback()
  - On success → setStep(3)
- UI:
  - Email input field
  - 6 input boxes for OTP + reset button
  - Resend OTP shows countdown → "Resend code" when enabled
