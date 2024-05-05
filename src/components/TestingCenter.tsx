"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

const TestingCenter = () => {
  const router = useRouter();
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex h-fit w-full items-center justify-between bg-white px-5 py-4">
        <h1 className="font-bold">Testing Center</h1>
        <Button
          className="space-x-2 rounded-full bg-blue hover:bg-blue/80"
          onClick={() => router.push("/testing-center/new")}
        >
          <Plus size={18} />
          <h1 className="">Plus </h1>
        </Button>
      </div>

      <div className="w-full flex-1 bg-white">
        <h1 className="">Hello</h1>
      </div>
    </div>
  );
};

export default TestingCenter;
