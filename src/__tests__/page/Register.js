// import React from "react";
// import { render, screen, fireEvent, act } from "@testing-library/react";
// import Register from "../../pages/Register";
// import { axiosClient } from "../../services/axiosClient";
// import { generateToken } from "../../notifications/firebaseConfig";
// import toast from "react-hot-toast";
// import { MemoryRouter } from "react-router-dom";
// import { useDispatch } from "react-redux";

// const mockNavigate = jest.fn();
// const mockDispatch = jest.fn();

// // Mock Step components (adjust the path if Register imports from './Step1')
// jest.mock("../../pages/Step1", () => () => <button>Next Step1</button>);
// jest.mock("../../pages/Step2", () => () => <button>Next Step2</button>);
// jest.mock("../../pages/Step3", () => () => <button>Next Step3</button>);
// jest.mock("../../pages/Step4", () => () => <button>Next Step4</button>);
// jest.mock("../../pages/Step5", () => () => <button>Next Step5</button>);
// jest.mock("../../pages/Step6", () => () => <button>Finish</button>);

// // Mock redux
// jest.mock("react-redux", () => ({
//   ...jest.requireActual("react-redux"),
//   useDispatch: jest.fn(),
// }));

// // Mock router
// jest.mock("react-router-dom", () => ({
//   ...jest.requireActual("react-router-dom"),
//   useNavigate: () => mockNavigate,
// }));

// // Mock axios client
// jest.mock("../../services/axiosClient", () => ({
//   get: jest.fn(),
//   put: jest.fn(),
// }));

// // Mock firebase token
// jest.mock("../../notifications/firebaseConfig", () => ({
//   generateToken: jest.fn(() => Promise.resolve("mocked-fcm-token")),
// }));

// // Mock toast
// jest.mock("react-hot-toast", () => ({
//   success: jest.fn(),
//   error: jest.fn(),
// }));

// const renderRegister = () =>
//   render(
//     <MemoryRouter>
//       <Register />
//     </MemoryRouter>
//   );

// describe("Register component", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     useDispatch.mockReturnValue(mockDispatch);
//   });

//   it("renders step 1 by default", () => {
//     renderRegister();
//     expect(screen.getByText(/next step1/i)).toBeInTheDocument();
//   });

//   it("navigates through steps and finishes registration", async () => {
//     renderRegister();

//     // Simulate navigating through steps
//     for (let i = 0; i < 5; i++) {
//       const nextBtn = screen.getByRole("button", { name: /next/i });
//       await act(async () => {
//         fireEvent.click(nextBtn);
//       });
//     }

//     // Finish button triggers admin check and FCM token update
//     axiosClient.get.mockResolvedValueOnce({
//       statusCode: 200,
//       result: { isActive: true },
//     });
//     axiosClient.put.mockResolvedValueOnce({});

//     const finishBtn = screen.getByRole("button", { name: /finish/i });

//     await act(async () => {
//       fireEvent.click(finishBtn);
//     });

//     expect(axiosClient.get).toHaveBeenCalled();
//     expect(generateToken).toHaveBeenCalled();
//     expect(axiosClient.put).toHaveBeenCalledWith(expect.any(String), {
//       fcmToken: "mocked-fcm-token",
//     });
//     expect(toast.success).toHaveBeenCalled();
//     expect(mockDispatch).toHaveBeenCalled();
//   });

//   it("shows error if admin is inactive", async () => {
//     renderRegister();

//     for (let i = 0; i < 5; i++) {
//       await act(async () => {
//         fireEvent.click(screen.getByRole("button", { name: /next/i }));
//       });
//     }

//     axiosClient.get.mockResolvedValueOnce({
//       statusCode: 200,
//       result: { isActive: false },
//     });

//     await act(async () => {
//       fireEvent.click(screen.getByRole("button", { name: /finish/i }));
//     });

//     expect(toast.error).toHaveBeenCalled();
//     expect(generateToken).not.toHaveBeenCalled();
//   });

//   it("handles API error gracefully", async () => {
//     renderRegister();

//     for (let i = 0; i < 5; i++) {
//       await act(async () => {
//         fireEvent.click(screen.getByRole("button", { name: /next/i }));
//       });
//     }

//     axiosClient.get.mockRejectedValueOnce(new Error("Network error"));

//     await act(async () => {
//       fireEvent.click(screen.getByRole("button", { name: /finish/i }));
//     });

//     expect(toast.error).toHaveBeenCalled();
//   });
// });
