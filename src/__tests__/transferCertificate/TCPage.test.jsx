import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useSelector } from "react-redux";

import { axiosClient } from "../../services/axiosClient";
import { TCPage } from "../../components/transferCertificate/TransferCertificate";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
  },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  success: jest.fn(),
  error: jest.fn(),
  Toaster: () => {
    const ReactForMock = require("react");
    return ReactForMock.createElement("div", { "data-testid": "toaster" });
  },
}));

jest.mock("motion/react", () => {
  const ReactForMock = require("react");

  const motionProxy = new Proxy(
    {},
    {
      get: (_target, tagName) =>
        ReactForMock.forwardRef(({ children, ...props }, ref) =>
          ReactForMock.createElement(tagName, { ...props, ref }, children)
        ),
    }
  );

  return {
    AnimatePresence: ({ children }) =>
      ReactForMock.createElement(ReactForMock.Fragment, null, children),
    motion: motionProxy,
  };
});

jest.mock("../../components/transferCertificate/PendingStep", () => ({
  PendingStep: ({ tcRequests, loading }) => {
    const ReactForMock = require("react");
    return ReactForMock.createElement(
      "div",
      { "data-testid": "pending-step" },
      loading ? "loading" : `pending:${Array.isArray(tcRequests) ? tcRequests.length : "invalid"}`
    );
  },
}));

jest.mock("../../components/transferCertificate/SelectionStep", () => ({
  SelectionStep: () => {
    const ReactForMock = require("react");
    return ReactForMock.createElement("div", { "data-testid": "selection-step" });
  },
}));

jest.mock("../../components/transferCertificate/TCFormStep", () => ({
  TCFormStep: () => {
    const ReactForMock = require("react");
    return ReactForMock.createElement("div", { "data-testid": "form-step" });
  },
}));

jest.mock("../../components/transferCertificate/AlumniStep", () => ({
  AlumniStep: ({ tcRequests, loading }) => {
    const ReactForMock = require("react");
    return ReactForMock.createElement(
      "div",
      { "data-testid": "alumni-step" },
      loading ? "loading" : `alumni:${Array.isArray(tcRequests) ? tcRequests.length : "invalid"}`
    );
  },
}));

describe("TCPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation((selector) =>
      selector({
        appAuth: {
          classAndSectionData: {
            selectedSession: {
              _id: "session-1",
            },
          },
        },
      })
    );
  });

  test("normalizes nested TC responses before rendering the pending tab", async () => {
    axiosClient.get.mockResolvedValue({
      statusCode: 200,
      result: {
        requests: {
          docs: [{ _id: "tc-request-1" }],
        },
      },
    });

    render(<TCPage />);

    await waitFor(() => {
      expect(screen.getByTestId("pending-step")).toHaveTextContent("pending:1");
    });
    expect(axiosClient.get).toHaveBeenCalledWith(
      "transfer-certificate/admin",
      expect.objectContaining({
        params: expect.objectContaining({
          sessionId: "session-1",
          limit: 500,
          status: "submitted",
        }),
      })
    );
  });
});
