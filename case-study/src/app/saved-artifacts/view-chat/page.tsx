'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, User, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db, type ChatData } from '@/lib/db';
import { Response } from '@/components/ai-elements/response';
import { cn } from '@/lib/utils';

export default function ViewChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChat = async () => {
      const id = searchParams?.get('id');
      if (!id) {
        router.push('/saved-artifacts');
        return;
      }

      try {
        const artifact = await db.artifacts.get(Number(id));
        if (artifact && artifact.type === 'chat') {
          setChatData(artifact.data as ChatData);
          setTitle(artifact.title);
        } else {
          router.push('/saved-artifacts');
        }
      } catch (err) {
        console.error('Failed to load chat:', err);
        router.push('/saved-artifacts');
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center p-6">
        <MessageSquare className="size-12 text-muted-foreground animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (!chatData) {
    return null;
  }

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/saved-artifacts')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Saved Artifacts
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            View-only chat history • {chatData.messages.length} message{chatData.messages.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Chat Messages */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              Chat History
            </CardTitle>
            <CardDescription>
              This is a saved conversation. To start a new chat, visit the Chat page.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto max-h-[600px]">
            <div className="space-y-4">
              {chatData.messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg p-4",
                    msg.role === 'user' ? 'bg-primary/10 ml-12' : 'bg-muted mr-12'
                  )}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold mb-2 uppercase text-muted-foreground">
                    {msg.role === 'user' ? (
                      <>
                        <User className="size-3" />
                        You
                      </>
                    ) : (
                      <>
                        <Bot className="size-3" />
                        Assistant
                      </>
                    )}
                  </div>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <Response>{msg.content}</Response>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                  )}
                  {msg.timestamp && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Saved chats are view-only and cannot be continued. To start a new conversation,{' '}
              <button
                onClick={() => router.push('/chat')}
                className="text-primary hover:underline font-medium"
              >
                go to the Chat page
              </button>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
