import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import Step5 from "../../pages/Step5";
import { useDispatch } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import toast from "react-hot-toast";
import EndPoints from "../../services/EndPoints";

// --- Mocks ---
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));
jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    post: jest.fn(),
  },
}));
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Minimal mock for StateAndDistricts JSON
jest.mock("../../utils/StatesAndDistricts.json", () => ({
  states: [
    {
      state: "Maharashtra",
      districts: ["Pune", "Mumbai"],
    },
  ],
}));

jest.mock("../../utils/regix", () => ({
  PINCODE: /^[0-9]{6}$/,
}));

jest.mock("../../services/EndPoints", () => ({
  ADMIN: {
    ADMIN_UPDATE_ADDRESS: "/api/admin/address",
  },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => [
    (key) => key, // return key as the translation for simplicity
  ],
}));

describe("Step5 Component", () => {
  const mockDispatch = jest.fn();
  const mockGoBack = jest.fn();
  const mockSetStep = jest.fn();
  const mockSetLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
  });

  const setup = () =>
    render(
      <Step5
        goback={mockGoBack}
        setStep={mockSetStep}
        setLoading={mockSetLoading}
      />
    );

  it("renders country, state, district, city, pincode, address fields and buttons", () => {
    setup();
    const countryDropdown = screen.getByTestId("selectCountry");
    const stateInput = screen.getByTestId("selectState");
    const districtInput = screen.getByTestId("selectDistrict");
    const cityInput = screen.getByPlaceholderText(/placeholders.city/i);
    const pincodeInput = screen.getByPlaceholderText(/placeholders.pincode/i);
    const addressInput = screen.getByPlaceholderText(
      /placeholders.schoolAdress/i
    );

    expect(countryDropdown).toBeInTheDocument();
    expect(stateInput).toBeInTheDocument();
    expect(districtInput).toBeInTheDocument();
    expect(cityInput).toBeInTheDocument();
    expect(pincodeInput).toBeInTheDocument();
    expect(countryDropdown).toBeInTheDocument();
  });

  // it("shows validation errors when submitting empty form", async () => {
  //   setup();
  //   const submitButton = screen.getByTestId("submit");
  //   fireEvent.click(submitButton);

  //   // Expect validation errors
  //   expect(screen.getByText("validationError.country")).toBeInTheDocument();
  //   expect(screen.getByText("validationError.state")).toBeInTheDocument();
  //   expect(screen.getByText("validationError.city")).toBeInTheDocument();
  //   expect(screen.getByText("validationError.district")).toBeInTheDocument();
  //   expect(screen.getByText("validationError.pincode")).toBeInTheDocument();
  //   expect(screen.getByText("validationError.address")).toBeInTheDocument();
  // });

  //   it("shows pincode digit validation error", async () => {
  //     setup();
  //     // Select country and state
  //     fireEvent.mouseDown(screen.getByTestId("selectCountry"));
  //     fireEvent.click(screen.getByText("India"));
  //     fireEvent.mouseDown(screen.getByTestId("selectState"));
  //     fireEvent.click(screen.getByText("Maharashtra"));
  //     fireEvent.mouseDown(screen.getByTestId("selectDistrict"));
  //     fireEvent.click(screen.getByText("Pune"));

  //     fireEvent.change(screen.getByTestId("city"), {
  //       target: { value: "Pune" },
  //     });
  //     fireEvent.change(screen.getByTestId("pincode"), {
  //       target: { value: "123" },
  //     });
  //     fireEvent.change(screen.getByTestId("address"), {
  //       target: { value: "Some address" },
  //     });

  //     fireEvent.click(screen.getByTestId("submit"));
  //     expect(
  //       await screen.findByTestId("pincodeError")
  //     ).toBeInTheDocument();
  //   });

  //   it("submits form and calls API successfully", async () => {
  //     setup();
  //     axiosClient.put.mockResolvedValueOnce({
  //       statusCode: 200,
  //       result: "Address updated",
  //     });

  //     // Fill form
  //     fireEvent.mouseDown(screen.getByTestId("selectCountry"));
  //     fireEvent.click(screen.getByText("India"));
  //     fireEvent.mouseDown(screen.getByTestId("selectState"));
  //     fireEvent.click(screen.getByText("Maharashtra"));
  //     fireEvent.mouseDown(screen.getByTestId("selectDistrict"));
  //     fireEvent.click(screen.getByText("Pune"));
  //     fireEvent.change(screen.getByTestId("city"), {
  //       target: { value: "Pune" },
  //     });
  //     fireEvent.change(screen.getByTestId("pincode"), {
  //       target: { value: "411001" },
  //     });
  //     fireEvent.change(screen.getByTestId("address"), {
  //       target: { value: "My address" },
  //     });

  //     await act(async () => {
  //       fireEvent.click(screen.getByTestId("submit"));
  //     });

  //     await waitFor(() => {
  //       expect(mockSetLoading).toHaveBeenCalledWith(true);
  //       expect(axiosClient.put).toHaveBeenCalledWith(
  //         EndPoints.ADMIN.ADMIN_UPDATE_ADDRESS,
  //         {
  //           country: "India",
  //           state: "Maharashtra",
  //           district: "Pune",
  //           city: "Pune",
  //           pincode: "411001",
  //           address: "My address",
  //         }
  //       );
  //       expect(toast.success).toHaveBeenCalledWith("Address updated");
  //       expect(mockDispatch).toHaveBeenCalled();
  //       expect(mockSetStep).toHaveBeenCalledWith(6);
  //       expect(mockSetLoading).toHaveBeenCalledWith(false);
  //     });
  //   });

  //   it("handles API error gracefully", async () => {
  //     setup();
  //     axiosClient.put.mockRejectedValueOnce("Error");

  //     // Fill minimal valid fields
  //     fireEvent.mouseDown(
  //       screen.getByRole("button", { name: /select country/i })
  //     );
  //     fireEvent.click(screen.getByText("India"));
  //     fireEvent.mouseDown(screen.getByRole("button", { name: /state/i }));
  //     fireEvent.click(screen.getByText("Maharashtra"));
  //     fireEvent.mouseDown(screen.getByRole("button", { name: /district/i }));
  //     fireEvent.click(screen.getByText("Pune"));
  //     fireEvent.change(screen.getByPlaceholderText("City"), {
  //       target: { value: "Pune" },
  //     });
  //     fireEvent.change(screen.getByPlaceholderText("Pincode"), {
  //       target: { value: "411001" },
  //     });
  //     fireEvent.change(screen.getByPlaceholderText("Address"), {
  //       target: { value: "My address" },
  //     });

  //     await act(async () => {
  //       fireEvent.click(screen.getByText("Continue"));
  //     });

  //     await waitFor(() => {
  //       expect(toast.error).toHaveBeenCalledWith("Error");
  //     });
  //     expect(mockSetLoading).toHaveBeenCalledWith(false);
  //   });

  it("calls goback when Back button clicked", () => {
    setup();
    fireEvent.click(screen.getByText("buttons.back"));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
