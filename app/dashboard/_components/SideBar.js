"use client"
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Layout, Shield } from "lucide-react";
import React from "react";
import UploadPdfDialog from "./UploadPdf";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";

const SideBar = () => {
  const { user } = useUser()
  const path = usePathname();
  const GetUserInfo = useQuery(api.user.GetUserInfo, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  })
  const fileList = useQuery(api.fileStorage.GetUserPDF, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  })
  return (
    <div className="shadow-md h-screen p-2 pt-7 md:p-6">
      <Link href={"/dashboard"} className="w-full flex justify-center">
        <img className="h-[24px] w-[100px] md:h-[28px] md:w-[120px]" src="/logo.png" alt="logo"></img>
      </Link>
      <div className="mt-7">
        <UploadPdfDialog isMaxFile={fileList?.length >= 20 && !GetUserInfo.upgrade} />
        <Link href={'/dashboard'}>
          <div className={`flex gap-2 mt-5 p-2 hover:bg-slate-200 cursor-pointer rounded-lg ${path == '/dashboard' && 'bg-slate-200'}`}>
            <Layout />
            <h2>Workspace</h2>
          </div>
        </Link>
        <Link href={'/dashboard/upgrade'}>
          <div className={`flex gap-2 mt-5 p-2 hover:bg-slate-200 cursor-pointer rounded-lg ${path == '/dashboard/upgrade' && 'bg-slate-200'}`}>
            <Shield />
            <h2>Upgrade</h2>
          </div>
        </Link>

      </div>
      {!GetUserInfo?.upgrade && <div className="absolute bottom-24 w-[80%]">
        <Progress value={(fileList?.length / 10) * 100} />
        <p className="text-sm mt-3">{fileList?.length} out of 10 Pdf Uploaded</p>
        <p className="text-sm mt-1 text-gray-500">Upgrade to upload more</p>
      </div>}
    </div>
  );
};

export default SideBar;
