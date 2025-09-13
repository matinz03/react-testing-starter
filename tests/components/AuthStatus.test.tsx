import { render, screen } from "@testing-library/react";
import AuthStatus from "../../src/components/AuthStatus";
import { AuthState, mockAuthState } from "../utils";

describe("AuthStatus", () => {
  const renderComponent = () => {
    const defaultStatus: AuthState = {
      isLoading: true,
      isAuthenticated: false,
      user: undefined,
    };

    const callMockAuth = (status: AuthState) => {
      mockAuthState(status);
      render(<AuthStatus />); 
      return {
        loading: () => screen.getByText(/loading/i),
        login: () => screen.getByRole("button", { name: /log in/i }),
        logout: () => screen.getByRole("button", { name: /log out/i }),
      };
    };

    return { defaultStatus, callMockAuth };
  };

  it("should render the loading message while fetching the auth status", () => {
    const { defaultStatus, callMockAuth } = renderComponent();
    const { loading } = callMockAuth(defaultStatus);
    expect(loading()).toBeInTheDocument();
  });
  it("should render log in button", () => {
    const { defaultStatus, callMockAuth } = renderComponent();
    const status = { ...defaultStatus, isLoading: false };
    const { login } = callMockAuth(status);
    expect(login()).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /log out/i })
    ).not.toBeInTheDocument();
  });
  it("should render the user if authenticated", () => {
    const { defaultStatus, callMockAuth } = renderComponent();
    const status = {
      ...defaultStatus,
      isAuthenticated: true,
      isLoading: false,
      user: { name: "mosh" },
    };
    const { logout } = callMockAuth(status);
    expect(logout()).toBeInTheDocument();
    expect(screen.getByText(status.user.name)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /log in/i })
    ).not.toBeInTheDocument();
  });
});
