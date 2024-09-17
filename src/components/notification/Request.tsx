"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarIcon } from "@nextui-org/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { UseMutationState } from "@/hooks/useMutationState";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

type Props = {
  id: Id<"requests">;
  imageUrl: string;
  username: string;
  email: string;
};

const Request = ({ id, imageUrl, username, email }: Props) => {
  const { mutate: denyRequest, pending: denyPending } = UseMutationState(
    api.request.deny
  );

  //accepting req
  const { mutate: acceptRequest, pending: acceptPending } = UseMutationState(
    api.request.accept
  );
  return (
    <>
      <Card className="w-full p-2 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4 truncate">
          <Avatar src={imageUrl} size="sm">
            <AvatarIcon />
          </Avatar>
          <div className="flex flex-col truncate">
            <h4 className="truncate">{username}</h4>
            <p className="text-xstext-muted-foreground truncate">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            disabled={denyPending || acceptPending}
            onClick={() => {
              acceptRequest({ id })
                .then(() => {
                  toast.success("Request Accepted");
                })
                .catch((error) => {
                  toast.error(
                    error instanceof ConvexError
                      ? error.data
                      : "Unexpected error occurred"
                  );
                });
            }}
          >
            <Check />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            disabled={denyPending || acceptPending}
            onClick={() => {
              denyRequest({ id })
                .then(() => {
                  toast.success("Request Canceled");
                })
                .catch((error) => {
                  toast.error(
                    error instanceof ConvexError
                      ? error.data
                      : "Unexpected error occurred"
                  );
                });
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </>
  );
};

export default Request;
