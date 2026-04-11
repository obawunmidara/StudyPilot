import { Button } from "flowbite-react";

export function DarkModeButton({onClick}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button color="dark" pill onClick={onClick}>
        Dark
      </Button>
    </div>
  );
}

export default DarkModeButton;