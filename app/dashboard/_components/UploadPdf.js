"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useAction, useMutation } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import uuid4 from "uuid4";

const UploadPdfDialog = ({ children }) => {
  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const addFileEntry = useMutation(api.fileStorage.AddFileEntryToDb);
  const getFileUrl = useMutation(api.fileStorage.getFileUrl);
  const embeddedDocument = useAction(api.myActions.ingest);
  const { user } = useUser();
  const [file, setFile] = useState();
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onFileSelect = (event) => {
    setFile(event.target.files[0]);
  };

  const onUpload = async () => {
    setLoading(true);
    const postUrl = await generateUploadUrl();

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    console.log(storageId);
    const fileId = uuid4();

    const fileUrl = await getFileUrl({ storageId: storageId });
    // Adding to db
    const response = await addFileEntry({
      fileId: fileId,
      storageId: storageId,
      fileName: fileName || "Untitled file",
      fileUrl: fileUrl,
      createdBy: user?.primaryEmailAddress?.emailAddress,
    });
    // Fetching processed data
    const apiResp = await axios.get("api/pdf-loader?pdfUrl=" + fileUrl);
    console.log(apiResp.data.result);
    await embeddedDocument({
      splitText: apiResp.data.result,
      fileId: fileId,
    });
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" onClick={() => setOpen(true)}>
          + Upload PDF File
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a PDF File</DialogTitle>
          <DialogDescription asChild>
            <div>
              <label>Select File to upload</label>
              <div className="gap-1 p-3 rounded-md border">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => onFileSelect(event)}
                />
              </div>
              <div className="mt-4">
                <label>File Name </label>
                <Input
                  placeholder="file name"
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button onClick={onUpload} disabled={loading}>
            {loading ? <Loader2Icon className="animate-spin" /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPdfDialog;