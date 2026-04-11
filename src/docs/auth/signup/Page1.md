# Register - Step1 (Phone Verification) Documentation

Step1 handles **phone number verification** in the multi-step Admin registration process.  
It validates the phone, sends OTP, manages timer, verifies OTP, and transitions to the next step.

## Features

- Phone number input with validation
- OTP request & verification (via MSG91 SDK)
- 6-digit OTP input fields with auto-focus
- OTP resend option with timer (30s cooldown)
- Refresh/reset OTP input
- LocalStorage persistence (temp_access_token)
- Progression to next registration step based on verification status
- Error + success notifications via toast
- Back button support
- Loading state during API calls

## Data Flow

Local State:
- phone → entered phone number
- otpVisible → toggles OTP input visibility
- otp → array [“”, “”, …] for 6-digit code
- timer → countdown for resend (default 30s)
- isResendDisabled → prevents resend until timer finishes
- error → validation errors

Redux (appAuth):
- status → registration status object (phoneVerified, emailVerified, etc.)
- phoneOtpReqId → OTP request session ID

LocalStorage:
- temp_access_token → temporary token returned after phone verification

## Main Flow

1. User enters phone number → click Continue
   - Validate phone format
   - Call ADMIN.STATUS API
   - If not verified, send OTP
   - Save phone & OTP request ID in Redux
   - Show OTP input fields

2. User enters OTP
   - Auto-focus moves between inputs
   - Backspace works properly
   - Reset button clears all digits

3. Verify OTP
   - Call window.verifyOtp
   - On success:
     - Save temp_access_token
     - Dispatch phoneVerified to Redux
     - Move to next step based on status:
       Step 2: Email Verification
       Step 3: Update Password
       Step 4: Basic Info
       Step 5: Address Info
       Step 6: Activation
   - On error → show toast error

4. Resend OTP
   - Enabled only after 30s
   - Calls window.retryOtp with "11" (SMS)
   - Refreshes timer, resets OTP input

## API Endpoints

- POST /admin/status → check admin registration status
- POST /admin/phone-token-verify → verify phone + OTP token

## Behaviour

- Success:
  - "OTP sent successfully"
  - "Phone verified successfully"
- Error:
  - Invalid phone number → validationError.phone
  - Wrong OTP → toast error
  - "Admin not found" → still send OTP
- Navigation:
  - Back button → calls goback()
  - If already active → redirect to /signup
- UI:
  - +91 prefix shown by default
  - 6 input boxes for OTP with reset icon
  - Resend OTP shows countdown → "Resend code" when enabled
