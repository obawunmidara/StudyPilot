import { useNavigate } from "react-router-dom";
import NewButton from "../ui/NewButton";
import ThemeToggle from "../ui/ThemeToggle"; 
import {Avatar, Dropdown, DropdownDivider, DropdownHeader, DropdownItem ,Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";


export function DashboardNavbar () {
  return (
    <Navbar fluid rounded>
      <NavbarBrand href="https://flowbite-react.com">
        <img src="/favicon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite React Logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span>
      </NavbarBrand>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar alt="User settings" img="https://flowbite.com/docs/images/people/profile-picture-5.jpg" rounded />
          }
        >
          <DropdownHeader>
            <span className="block text-sm">Bonnie Green</span>
            <span className="block truncate text-sm font-medium">name@flowbite.com</span>
          </DropdownHeader>
          <DropdownItem>Dashboard</DropdownItem>
          <DropdownItem>Settings</DropdownItem>
          <DropdownItem>Earnings</DropdownItem>
          <DropdownDivider />
          <DropdownItem>Sign out</DropdownItem>
        </Dropdown>
        <NavbarToggle />
      </div>
    </Navbar>
  );
}


export default function AppNavbar({ dark, setDark }) {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        background: dark ? "" : "#ffffff",
        borderBottom: dark ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.08)",
        transition: "background 0.3s",
      }}
      className="flex items-center justify-between p-4"
    >
      <div className="font-logo font-bold xl:text-3xl text-xl tracking-tight">
         StudyPilot
      </div>
      <div className="flex items-center gap-3">
        <NewButton onClick={() => navigate("/signup")}>Get Started</NewButton>
        <ThemeToggle dark={dark} setDark={setDark} />
      </div>
    </nav>
  );
}