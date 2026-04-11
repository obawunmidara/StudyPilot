import { Button } from "flowbite-react";

export function LightModeButton({onClick}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button color="light" pill onClick={onClick}>
        Light
      </Button>
    </div>
  );
}
export default LightModeButton;