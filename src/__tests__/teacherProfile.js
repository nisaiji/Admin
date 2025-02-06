import React from 'react';  // Add this import
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileForm from '../../src/components/admin/TeacherProfile'; // Adjust the import based on your component location
import userEvent from '@testing-library/user-event';

describe('Peacher Profile Form Tests', () => {
  const requestBody = {
    firstname: "First name",
    lastname: "Last name",
    dob: '01/01/1970',
    gender: "Male",
    bloodGroup: "A+",
    phone: "1234567890",
    university: "Dummy University",
    degree: "BA"
  };
  test('save button is non clickable when form is valid', async () => {
    render(<ProfileForm />);

    const firstname = screen.getByTestId('firstname');
    expect(firstname).toBeInTheDocument();

    const lastname = screen.getByTestId('lastname');
    expect(lastname).toBeInTheDocument();

    const dob = screen.getByPlaceholderText('placeholders.dob');
    expect(dob).toBeInTheDocument();

    const gender = screen.getByTestId('gender');
    expect(gender).toBeInTheDocument();

    const bloodGroup = screen.getByTestId('bloodGroup');
    expect(bloodGroup).toBeInTheDocument();

    const phone = screen.getByTestId('phone');
    expect(phone).toBeInTheDocument();

    const university = screen.getByTestId('university');
    expect(university).toBeInTheDocument();

    const degree = screen.getByTestId('degree');
    expect(degree).toBeInTheDocument();

    // change firstname value
    fireEvent.change(firstname, { target: { value: requestBody.firstname } });
    expect(firstname.value).toBe(requestBody.firstname);

    // change lastname value
    fireEvent.change(lastname, { target: { value: requestBody.lastname } });
    expect(lastname.value).toBe(requestBody.lastname);

    // change dob value
    fireEvent.change(dob, { target: { value: requestBody.dob } });
    expect(dob.value).toBe(requestBody.dob);

    // change gender value
    fireEvent.change(gender, { target: { value: requestBody.gender } });
    expect(gender.value).toBe(requestBody.gender);

    // change bloodGroup value
    fireEvent.change(bloodGroup, { target: { value: requestBody.bloodGroup } });
    expect(bloodGroup.value).toBe(requestBody.bloodGroup);

    // change phone value
    fireEvent.change(phone, { target: { value: requestBody.phone } });
    expect(phone.value).toBe(requestBody.phone);

    // change university value
    fireEvent.change(university, { target: { value: requestBody.university } });
    expect(university.value).toBe(requestBody.university);

    // change degree value
    fireEvent.change(degree, { target: { value: requestBody.degree } });
    expect(degree.value).toBe(requestBody.degree);

    // Check if the save button is enabled and clickable
    const saveButton = screen.getByTestId(/submit/i);
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);


  });
  test('save button is non clickable when form is invalid', async () => {
    render(<ProfileForm />);

    const firstname = screen.getByTestId('firstname');

    const lastname = screen.getByTestId('lastname');

    const dob = screen.getByPlaceholderText('placeholders.dob');

    const gender = screen.getByTestId('gender');

    const bloodGroup = screen.getByTestId('bloodGroup');

    const phone = screen.getByTestId('phone');

    const university = screen.getByTestId('university');

    const degree = screen.getByTestId('degree');

    // change firstname value
    fireEvent.change(firstname, { target: { value: '' } });

    // change lastname value
    fireEvent.change(lastname, { target: { value: '' } });

    // change dob value
    fireEvent.change(dob, { target: { value: '' } });

    // change gender value
    fireEvent.change(gender, { target: { value: '' } });

    // change bloodGroup value
    fireEvent.change(bloodGroup, { target: { value: '' } });

    // change phone value
    fireEvent.change(phone, { target: { value: '' } });

    // change university value
    fireEvent.change(university, { target: { value: '' } });

    // change degree value
    fireEvent.change(degree, { target: { value: '' } });

    // Check if the save button is enabled and clickable
    const saveButton = screen.getByTestId(/submit/i);
    await userEvent.click(saveButton);
    expect(screen.getByText(/validationError.firstName/i)).toBeInTheDocument();
    expect(screen.getByText(/validationError.lastName/i)).toBeInTheDocument();
    expect(screen.getByText(/validationError.dob/i)).toBeInTheDocument();
    expect(screen.getByText(/validationError.gender/i)).toBeInTheDocument();
    expect(screen.getByText(/validationError.bloodGroup/i)).toBeInTheDocument();
    expect(screen.getByText(/validationError.university/i)).toBeInTheDocument();
    expect(screen.getByText(/validationError.qualification/i)).toBeInTheDocument();
    expect(screen.getByText(/validationError.phone/i)).toBeInTheDocument();

  });
});
