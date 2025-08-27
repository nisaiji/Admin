import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Step6 from "../../pages/Step6";

// Mock useTranslation so no i18n config is required
jest.mock("react-i18next", () => ({
  useTranslation: () => [
    (key) => {
      const dict = {
        "register.verificationPending": "Verification Pending",
        "register.pendingMessage": "Please wait while we verify your details.",
        "buttons.back": "Back",
        "buttons.checkProgress": "Check Progress",
      };
      return dict[key] || key;
    },
  ],
}));

describe("Step6 Component", () => {
  const mockCheckProgress = jest.fn();
  const mockGoBack = jest.fn();

  const setup = (props = {}) => {
    return render(
      <Step6
        checkProgress={mockCheckProgress}
        goback={mockGoBack}
        isDisable={props.isDisable}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders pending image and texts", () => {
    setup();
    expect(screen.getByAltText("")).toBeInTheDocument();
    expect(
      screen.getByText("Verification Pending")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please wait while we verify your details.")
    ).toBeInTheDocument();
  });

  test("calls goback when Back button clicked", () => {
    setup();
    fireEvent.click(screen.getByTestId("back"));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  test("calls checkProgress when Check Progress button clicked", () => {
    setup();
    fireEvent.click(screen.getByTestId("checkProgress"));
    expect(mockCheckProgress).toHaveBeenCalledTimes(1);
  });

  test("disables Check Progress button when isDisable is true", () => {
    setup({ isDisable: true });
    const btn = screen.getByTestId("checkProgress");
    expect(btn).toBeDisabled();
  });
});
