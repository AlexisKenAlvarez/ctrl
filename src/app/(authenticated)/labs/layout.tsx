import type { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full p-5">
      <div className="mx-auto w-full max-w-screen-lg 2xl:px-0 md:px-16">{children}</div>
    </div>
  );
};

export default layout;
