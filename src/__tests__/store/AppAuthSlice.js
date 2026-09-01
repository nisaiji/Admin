import { configureStore } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import appAuthSlice, {
  getInitialSessionCreatedState,
  setSessionCreatedStatus,
} from "../../store/AppAuthSlice";

jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
  },
}));

describe("AppAuthSlice onboarding session state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("uses stored false before falling back to token claims", () => {
    localStorage.setItem("isSessionCreated", "false");
    localStorage.setItem("access_token", "mock-token");
    jwtDecode.mockReturnValue({ isSessionCreated: true });

    expect(getInitialSessionCreatedState()).toBe(false);
    expect(jwtDecode).not.toHaveBeenCalled();
  });

  test("falls back to the access token claim when storage is missing", () => {
    localStorage.setItem("access_token", "mock-token");
    jwtDecode.mockReturnValue({ isSessionCreated: true });

    expect(getInitialSessionCreatedState()).toBe(true);
    expect(jwtDecode).toHaveBeenCalledWith("mock-token");
  });

  test("persists onboarding completion in local storage and redux state", async () => {
    const store = configureStore({
      reducer: {
        appAuth: appAuthSlice.reducer,
      },
    });

    await store.dispatch(setSessionCreatedStatus(true));

    expect(localStorage.getItem("isSessionCreated")).toBe("true");
    expect(store.getState().appAuth.isSessionCreated).toBe(true);
  });
});
