"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Separator } from "./ui/separator";

const TestingCenter = () => {
  const router = useRouter();
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col">
      <div className="flex h-fit w-full items-center justify-between bg-white px-5 py-4">
        <h1 className="font-bold">Testing Center</h1>
        <Button
          className="space-x-2 rounded-full bg-blue hover:bg-blue/80"
          onClick={() => router.push("/testing-center/new")}
        >
          <Plus size={18} />
          <h1 className="">Add new </h1>
        </Button>
      </div>
      <Separator />
      <div className="w-full flex-1 bg-white"></div>
    </div>
  );
};

export default TestingCenter;
