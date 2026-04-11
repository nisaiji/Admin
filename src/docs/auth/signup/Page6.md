# Step6 Component Documentation

## PURPOSE

The Step6 component displays a verification pending screen in the registration process.  
It informs the user that their verification is not yet complete and provides navigation options to either go back or check the progress.

## DATA SHAPES (Props)

- checkProgress: function → Callback function triggered when the user clicks the Check Progress button.  
- isDisable: boolean→ Controls whether the Check Progress button is disabled.  
- goback: function→ Callback function triggered when the user clicks the Back button.

## KEY FLOW

1. The pending verification image and messages are shown.  
2. The Back button lets the user return to the previous step.  
3. The Check Progress button (if enabled) calls the checkProgress function to verify the current status.  

## BEHAVIOUR

- The UI is centered with a pending illustration.  
- Text and labels are internationalized using react-i18next.  
- The Back button always works and triggers the goback callback.  
- The Check Progress button is conditionally disabled based on isDisable.  
- Both buttons have smooth hover/active states with scale animations.  
