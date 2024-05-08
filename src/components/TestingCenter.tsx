"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const TestingCenter = () => {
  const router = useRouter();
  return (
    <div className="mx-auto flex w-full flex-1 flex-col">
      <div className="sticky top-[5.8srem] z-10 w-full">
        <div className="drop-shadow-md flex h-20 w-full items-center justify-between bg-white px-5 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link href={`/testing-center/new`}>
            <Button
              className="space-x-2 rounded-full bg-blue hover:bg-blue/80"
            >
              <Plus size={18} />
              <h1 className="">Add new </h1>
            </Button>
          </Link>
        </div>
        <Separator />
      </div>

      <div className="w-full flex-1 bg-white"></div>
    </div>
  );
};

export default TestingCenter;
