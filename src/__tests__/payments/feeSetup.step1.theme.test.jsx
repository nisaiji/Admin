import React from "react";
import { render, screen } from "@testing-library/react";

import Step1 from "../../components/payments/FeeStructureSetup/Step1";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { useDispatch, useSelector } from "react-redux";

describe("Fee structure step 1 theme", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(jest.fn());
    useSelector.mockImplementation((selector) =>
      selector({
        appConfig: { isDarkMode: false },
      }),
    );
  });

  test("uses light theme classes in fee head setup", () => {
    render(
      <Step1
        feeHeads={[]}
        setFeeHeads={jest.fn()}
        sessionId="session-1"
      />,
    );

    expect(screen.getByRole("heading", { name: "Create Fee Heads" })).toHaveClass(
      "text-[#0f0f0f]",
    );
    expect(screen.getByText("Head Name")).toHaveClass("text-[#002861]");
    expect(screen.getByPlaceholderText("Enter Head Name")).toHaveClass(
      "bg-white",
      "text-[#0f0f0f]",
    );
  });

  test("renders recurring fee heads as recurring", () => {
    render(
      <Step1
        feeHeads={[
          {
            _id: "head-1",
            name: "Admission Fee",
            type: "RECURRING",
            refundable: true,
            label: "Admission Fee",
          },
        ]}
        setFeeHeads={jest.fn()}
        sessionId="session-1"
        readOnly
      />,
    );

    expect(screen.getByText("Recurring")).toBeInTheDocument();
  });
});
