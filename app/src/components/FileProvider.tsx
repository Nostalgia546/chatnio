import React, {useEffect, useRef, useState} from "react";
import {AlertCircle, File, FileCheck, Plus, X} from "lucide-react";
import "../assets/file.less";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useTranslation } from "react-i18next";
import { Alert, AlertTitle } from "./ui/alert.tsx";
import { useToast } from "./ui/use-toast.ts";

export type FileObject = {
  name: string;
  content: string;
}

type FileProviderProps = {
  id?: string;
  className?: string;
  maxLength?: number;
  onChange?: (data: FileObject) => void;
  setClearEvent?: (event: () => void) => void;
};

type FileObjectProps = {
  id?: string;
  className?: string;
  onChange?: (filename: string, data: string) => void;
};

function FileProvider({
  id,
  className,
  onChange,
  maxLength,
  setClearEvent,
}: FileProviderProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [active, setActive] = useState(false);
  const [filename, setFilename] = useState<string>("");
  const ref = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    setClearEvent && setClearEvent(() => clear);

    return () => {
      setClearEvent && setClearEvent(() => {});
    }
  }, [setClearEvent]);

  useEffect(() => {
    if (!ref.current) return;
    const target = ref.current as HTMLLabelElement;

    target.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    target.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target?.result as string;
          if (!/^[\x00-\x7F]*$/.test(data)) {
            toast({
              title: t("file.parse-error"),
              description: t("file.parse-error-prompt"),
            });
            handleChange();
          } else {
            handleChange(e.target?.result as string);
          }
        };
        reader.readAsText(file);
      } else {
        handleChange();
      }
    });
    target.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    return () => {
      target.removeEventListener("dragover", () => {});
      target.removeEventListener("drop", () => {});
    }
  }, [ref]);

  function clear() {
    setFilename("");
    setActive(false);
    onChange?.({ name: "", content: "" });
  }

  function handleChange(name?: string, data?: string) {
    name = name || "";
    data = data || "";

    if (maxLength && data.length > maxLength) {
      data = data.slice(0, maxLength);
      toast({
        title: t("file.max-length"),
        description: t("file.max-length-prompt"),
      });
    }
    setActive(data !== "");
    if (data === "") {
      setFilename("");
      onChange?.({ name: "", content: "" });
    } else {
      setFilename(name);
      onChange?.({ name: name, content: data });
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <div className={`file-action`}>
            {
              active ?
                <FileCheck className={`h-3.5 w-3.5`} /> :
                <Plus className={`h-3.5 w-3.5`} />
            }
          </div>
        </DialogTrigger>
        <DialogContent className={`file-dialog flex-dialog`}>
          <DialogHeader>
            <DialogTitle>{t("file.upload")}</DialogTitle>
            <DialogDescription asChild>
              <div className={`file-wrapper`}>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("file.type")}</AlertTitle>
                </Alert>
                <label className={`drop-window`} htmlFor={id} ref={ref}>
                  {filename ? (
                    <div className={`file-object`}>
                      <File className={`h-4 w-4`} />
                      <p>{filename}</p>
                      <X
                        className={`h-3.5 w-3.5 ml-1 close`}
                        onClick={(e) => {
                          handleChange();
                          e.preventDefault();
                        }}
                      />
                    </div>
                  ) : (
                    <p>{t("file.drop")}</p>
                  )}
                </label>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <FileObject
        id={id}
        className={className}
        onChange={handleChange}
      />
    </>
  );
}

function FileObject({
  id,
  className,
  onChange,
}: FileObjectProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        if (!/^[\x00-\x7F]*$/.test(data)) {
          toast({
            title: t("file.parse-error"),
            description: t("file.parse-error-prompt"),
          });
          onChange?.(file.name, "");
        } else {
          onChange?.(file.name, e.target?.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      onChange?.("", "");
    }
  };
  return (
    <input
      id={id}
      type="file"
      className={className}
      onChange={handleChange}
      multiple={false}
      style={{ display: "none" }}
    />
  );
}

export default FileProvider;
