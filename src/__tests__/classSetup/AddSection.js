import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Addsection from "../../components/classSetup/Addsection";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("react-datepicker/dist/react-datepicker.css", () => {});

const mockStore = configureStore([]);
const store = mockStore({ appConfig: { isDarkMode: false } });

describe("Addsection Component", () => {
  const setAddSectionModelOpen = jest.fn();
  const getAllClass = jest.fn();
  const clickedClassId = "class123";

  beforeEach(() => {
    jest.clearAllMocks();
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: { class: [{ section: [{ _id: "1", name: "A" }] }] },
    });
    axiosClient.get.mockResolvedValueOnce({
      statusCode: 200,
      result: [{ _id: "teacher1", firstname: "John", lastname: "Doe" }],
    });
  });

  const renderComponent = () => {
    render(
      <Provider store={store}>
        <Addsection
          setAddSectionModelOpen={setAddSectionModelOpen}
          clickedClassId={clickedClassId}
          getAllClass={getAllClass}
        />
      </Provider>
    );
  };
});
