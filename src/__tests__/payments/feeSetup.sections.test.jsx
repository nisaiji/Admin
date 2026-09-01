import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { PaymentsRepoProvider } from "../../features/payments/store/PaymentsRepoProvider";
import FeeStructureWizardPage from "../../features/payments/pages/FeeStructureWizardPage";

function renderWizard() {
  return render(
    <PaymentsRepoProvider>
      <MemoryRouter initialEntries={["/payments/fee-setup/new"]}>
        <Routes>
          <Route
            path="/payments/fee-setup/new"
            element={<FeeStructureWizardPage />}
          />
        </Routes>
      </MemoryRouter>
    </PaymentsRepoProvider>,
  );
}

function getClassCard(className) {
  return screen.getByRole("heading", { name: className }).closest("article");
}

describe("Fee Setup - setup modes and sections", () => {
  test("defaults to selected classes and saves only included classes", async () => {
    const user = userEvent.setup();
    renderWizard();

    expect(
      screen.getByRole("button", { name: /Selected classes/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Class 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Class 5" })).toBeInTheDocument();

    const classTwoCard = getClassCard("Class 2");
    await user.click(
      within(classTwoCard).getByRole("button", { name: "Include this class" }),
    );
    await user.type(
      within(classTwoCard).getByLabelText(
        "Amount per installment for all selected sections in Class 2",
      ),
      "100",
    );

    await user.click(screen.getByRole("button", { name: "Proceed to Review" }));

    expect(screen.getByText("Review Class Fee Structures")).toBeInTheDocument();
    expect(screen.getByText("Selected classes")).toBeInTheDocument();
    expect(screen.getByText(/^Class 2$/)).toBeInTheDocument();
    expect(screen.queryByText(/^Class 1$/)).toBeNull();
    expect(screen.queryByText(/^Class 3$/)).toBeNull();
  });

  test("single class/section mode saves only the chosen class and chosen sections", async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.click(
      screen.getByRole("button", { name: /Single class\/section/i }),
    );
    await user.selectOptions(screen.getByLabelText("Select class"), "class_2");

    expect(screen.queryByRole("heading", { name: "Class 1" })).toBeNull();

    const classTwoCard = getClassCard("Class 2");
    await user.click(within(classTwoCard).getByRole("button", { name: "B" }));
    await user.type(
      within(classTwoCard).getByLabelText(
        "Amount per installment for all selected sections in Class 2",
      ),
      "120",
    );

    await user.click(screen.getByRole("button", { name: "Proceed to Review" }));

    expect(screen.getByText("Review Class Fee Structures")).toBeInTheDocument();
    expect(screen.getByText("Single class/section")).toBeInTheDocument();
    expect(screen.getByText(/^Class 2$/)).toBeInTheDocument();
    expect(screen.getByText(/^B$/)).toBeInTheDocument();
    expect(screen.queryByText("A, B, C")).toBeNull();
  });

  test("all classes mode renders dynamic sections and shows classes with no sections", async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.click(
      screen.getByRole("button", { name: /All classes & sections/i }),
    );

    const classOneCard = getClassCard("Class 1");
    const classFourCard = getClassCard("Class 4");
    const classFiveCard = getClassCard("Class 5");

    expect(within(classOneCard).getByText("Selected sections: A, B")).toBeInTheDocument();
    expect(
      within(classFourCard).getByText("Selected sections: A, B, C, D, E, F, G, H"),
    ).toBeInTheDocument();
    expect(within(classFourCard).getByRole("button", { name: "H" })).toBeInTheDocument();
    expect(within(classOneCard).queryByRole("button", { name: "H" })).toBeNull();
    expect(
      within(classFiveCard).getByText("No sections found for this class."),
    ).toBeInTheDocument();
  });
});
