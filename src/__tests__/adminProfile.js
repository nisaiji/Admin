import React from "react"; // Add this import
import { render, screen, fireEvent } from "@testing-library/react";
import ProfileForm from "../../src/components/admin/AdminProfile"; // Adjust the import based on your component location
import userEvent from "@testing-library/user-event";

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };

describe("Admin Profile Form Tests", () => {
  const requestBody = {
    schoolName: "school name",
    principal: "principal",
    schoolBoard: "CBSE",
    affiliationNo: "123456789",
    address: "dummy address",
    country: "India",
    district: "Jaipur",
    city: "Jaipur",
    pincode: "123456",
    state: "Rajasthan",
    email: "abc@gmail.com",
    username: "username",
    schoolNumber: "123456789",
    phone: "1234567890",
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    whatsapp: "",
    youtube: "",
  };

  test("renders school board select and validates on selection", async () => {
    render(<ProfileForm />);

    // Check if the school board select is rendered
    const schoolBoardSelect = screen.getByTestId("schoolName");
    expect(schoolBoardSelect).toBeInTheDocument();

    // Select a school board option
    fireEvent.change(schoolBoardSelect, {
      target: { value: requestBody.schoolBoard },
    });
    expect(schoolBoardSelect.value).toBe(requestBody.schoolBoard);

    // Check if the school board blur and empty
    fireEvent.change(schoolBoardSelect, { target: { value: "" } });
    expect(schoolBoardSelect.value).toBe("");
    // await fireEvent.blur(schoolBoardSelect)
    // expect(screen.getByText(/validationError.schoolBoard/i)).toBeInTheDocument();
  });
  test("renders country, state, and district fields if country India", () => {
    render(<ProfileForm />);

    // Country selection
    const countrySelect = screen.getByTestId(/country/i);
    fireEvent.change(countrySelect, { target: { value: requestBody.country } });

    // Check if state and district dropdowns are displayed for India
    const stateSelect = screen.getByTestId(/state-select/i);
    const districtSelect = screen.getByTestId(/district-select/i);
    expect(stateSelect).toBeInTheDocument();
    expect(districtSelect).toBeInTheDocument();

    // Select state
    fireEvent.change(stateSelect, { target: { value: requestBody.state } });
    expect(stateSelect.value).toBe(requestBody.state);

    // Select district
    fireEvent.change(districtSelect, {
      target: { value: requestBody.district },
    });
    expect(districtSelect.value).toBe(requestBody.district);
  });
  test("renders country, state, and district fields if country otherthan India", () => {
    render(<ProfileForm />);

    // Country selection
    const countrySelect = screen.getByTestId(/country/i);
    fireEvent.change(countrySelect, { target: { value: "Afghanistan" } });

    // Check if state and district dropdowns are displayed for India
    const stateSelect = screen.getByTestId(/state-input/i);
    const districtSelect = screen.getByTestId(/district-input/i);
    expect(stateSelect).toBeInTheDocument();
    expect(districtSelect).toBeInTheDocument();

    // Select state
    fireEvent.change(stateSelect, { target: { value: "af-state" } });
    expect(stateSelect.value).toBe("af-state");

    // Select district
    fireEvent.change(districtSelect, { target: { value: "af-disctrict" } });
    expect(districtSelect.value).toBe("af-disctrict");
  });
  test("save button is clickable for admin profile when form is valid", async () => {
    render(<ProfileForm />);

    // Check if the school name select is rendered

    const schoolName = screen.getByTestId("schoolName");
    const email = screen.getByTestId("email");
    const principal = screen.getByTestId("principal");
    const admin = screen.getByTestId("username");
    const affiliation = screen.getByTestId("affiliationNo");
    const schoolNumber = screen.getByTestId("schoolNumber");
    const schoolAddress = screen.getByTestId("address");
    const schoolBoardSelect = screen.getByTestId("schoolBoard");
    const countrySelect = screen.getByTestId("country");

    const city = screen.getByTestId("city");
    const pincode = screen.getByTestId("pincode");

    fireEvent.change(schoolName, { target: { value: requestBody.schoolName } });
    fireEvent.change(email, { target: { value: requestBody.email } });
    fireEvent.change(principal, { target: { value: requestBody.principal } });
    fireEvent.change(admin, { target: { value: requestBody.admin } });
    fireEvent.change(affiliation, {
      target: { value: requestBody.affiliation },
    });
    fireEvent.change(schoolNumber, {
      target: { value: requestBody.schoolNumber },
    });
    fireEvent.change(schoolAddress, {
      target: { value: requestBody.schoolAddress },
    });
    fireEvent.change(schoolBoardSelect, {
      target: { value: requestBody.schoolBoard },
    });

    fireEvent.change(countrySelect, { target: { value: requestBody.country } });

    const stateSelect = screen.getByTestId(/state-select/i);
    const districtSelect = screen.getByTestId("district-select");
    await fireEvent.change(stateSelect, {
      target: { value: requestBody.state },
    });
    fireEvent.change(districtSelect, {
      target: { value: requestBody.district },
    });

    fireEvent.change(city, { target: { value: requestBody.city } });

    fireEvent.change(pincode, { target: { value: requestBody.pincode } });

    // Check if the save button is enabled and clickable
    const saveButton = screen.getByTestId(/account-submit/i);
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);
    // Optionally, check for expected behavior after form submission
  });
  test("renders phone and validaes on change", async () => {
    render(<ProfileForm />);

    // Check if the school board select is rendered
    const phone = screen.getByTestId("phone");
    expect(phone).toBeInTheDocument();

    // change phone value
    fireEvent.change(phone, { target: { value: requestBody.phone } });
    expect(phone.value).toBe(requestBody.phone);

    // Check if the phone blur and empty
    fireEvent.change(phone, { target: { value: "" } });
    expect(phone.value).toBe("");
    // await fireEvent.blur(phone)
    // expect(screen.getByTestId(/phone-error/i)).toBe('')
  });
  test("save button is clickable for social profile when form is valid", async () => {
    render(<ProfileForm />);

    // Check if the school board select is rendered
    const phone = screen.getByTestId("phone");
    const website = screen.getByTestId("website");
    const facebook = screen.getByTestId("facebook");
    const instagram = screen.getByTestId("instagram");
    const linkedin = screen.getByTestId("linkedin");
    const twitter = screen.getByTestId("twitter");
    const whatsapp = screen.getByTestId("whatsapp");
    const youtube = screen.getByTestId("youtube");

    // change phone value
    fireEvent.change(phone, { target: { value: requestBody.phone } });
    expect(phone.value).toBe(requestBody.phone);

    // change website value
    fireEvent.change(website, { target: { value: requestBody.website } });
    expect(website.value).toBe(requestBody.website);

    // change facebook value
    fireEvent.change(facebook, { target: { value: requestBody.facebook } });
    expect(facebook.value).toBe(requestBody.facebook);

    // change instagram value
    fireEvent.change(instagram, { target: { value: requestBody.instagram } });
    expect(instagram.value).toBe(requestBody.instagram);

    // change linkedin value
    fireEvent.change(linkedin, { target: { value: requestBody.linkedin } });
    expect(linkedin.value).toBe(requestBody.linkedin);

    // change twitter value
    fireEvent.change(twitter, { target: { value: requestBody.twitter } });
    expect(twitter.value).toBe(requestBody.twitter);

    // change whatsapp value
    fireEvent.change(whatsapp, { target: { value: requestBody.whatsapp } });
    expect(whatsapp.value).toBe(requestBody.whatsapp);

    // change youtube value
    fireEvent.change(youtube, { target: { value: requestBody.youtube } });
    expect(youtube.value).toBe(requestBody.youtube);

    // Check if the save button is enabled and clickable
    const saveButton = screen.getByTestId(/social-submit/i);
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);
  });
});
