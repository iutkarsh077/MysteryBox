"use client";
import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/models/User";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { acceptMessagesSchema as AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import Link from "next/link";

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();

  const baseUrl = `${window.location.protocol}//${window.location.host}`;

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      console.log(baseUrl)
      const response = await fetch(
        `${baseUrl}/api/accept-messages`,
        {
          cache: "no-store",
          next: {
            revalidate: 0,
          },
          method: "GET",
        }
      );
      const data = await response.json();
      setValue("acceptMessages", data.isAcceptingMessage);
    } catch (error) {
      //   const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: "Failed to fetch message settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await fetch(`${baseUrl}/api/get-messages`, {
            cache: "no-store",
            next: {
                revalidate: 0,
            },
            method: "GET",
        });
        const data = await response.json();
        setMessages(data.messages || []);
        // console.log(response)
        if (refresh) {
          toast({
            title: "Refreshed Messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        // const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description: "Failed to fetch messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast]
  );

  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();

    fetchAcceptMessages();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/accept-messages`, {
        method: "POST",
        body: JSON.stringify({ acceptMessages: !acceptMessages }),
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        next: {
            revalidate: 0,
        }
      });
      const data = await response.json();
      setValue("acceptMessages", !acceptMessages);
      toast({
        title: data.message,
        variant: "default",
      });
    } catch (error) {
    //   const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          "Failed to update message settings",
        variant: "destructive",
      });
    }
  };

  if (!session || !session.user) {
    return (
      <div className="flex min-h-[500px] justify-center items-center text-3xl">
        This is DashBoard. Please{" "}
        <Link href="/sign-in" className="text-blue-600 ml-1 mr-1 font-semibold">
          LOGIN
        </Link>{" "}
        Again.
      </div>
    );
  }

  const { username } = session.user as User;
  const profileUrl = `${baseUrl}/you/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL Copied!",
      description: "Profile URL has been copied to clipboard.",
    });
  };

  return (
    <div className=" pl-10 pt-10  pr-10 bg-white rounded w-full overflow-x-hidden">
      <h1 className="text-2xl md:text-4xl font-bold  mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-0 mb-2 md:mb-0"
          />
          <Button onClick={copyToClipboard} className="w-full md:w-auto">
            Copy
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4 w-full md:w-auto"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4  animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
