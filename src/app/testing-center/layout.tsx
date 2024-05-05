import type { ReactNode } from "react";

const layout = ({children}: {children: ReactNode}) => {
  return (
    <div className="flex-1 flex flex-col p-3 bg-gray-100">
      {children}
    </div>
  );
}

export default layout;