'use client';

import { useChat } from '@ai-sdk/react';
import { CopyIcon, MessageSquare, Paperclip, X } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';
import { Action, Actions } from '@/components/ai-elements/actions';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';

const models = [
  {
    name: 'Claude Sonnet 4',
    value: 'claude-sonnet-4-20250514',
  },
  {
    name: 'Claude Opus 4.1',
    value: 'claude-opus-4-1-20250805',
  },
  {
    name: 'Claude Opus 4',
    value: 'claude-opus-4-20250514',
  },
  {
    name: 'Claude 3.7 Sonnet',
    value: 'claude-3-7-sonnet-20250219',
  },
  {
    name: 'Claude 3.5 Sonnet',
    value: 'claude-3-5-sonnet-20241022',
  },
  {
    name: 'Claude 3.5 Haiku',
    value: 'claude-3-5-haiku-20241022',
  },
  {
    name: 'Claude 3 Opus',
    value: 'claude-3-opus-20240229',
  },
  {
    name: 'Claude 3 Haiku',
    value: 'claude-3-haiku-20240307',
  },
  {
    name: 'GPT-5',
    value: 'gpt-5',
  },
  {
    name: 'GPT-4o',
    value: 'gpt-4o',
  },
  {
    name: 'GPT-4o Mini',
    value: 'gpt-4o-mini',
  },
];

const suggestions = [
  'Explain the concept of stare decisis in common law',
  'What are the key elements of a valid contract?',
  'Help me outline a legal memo on tort liability',
];

const ChatBotDemo = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Require text content - files alone aren't valid
    if (input.trim()) {
      console.log('=== SUBMITTING MESSAGE ===');
      console.log('Text:', input);
      console.log('Files:', files);
      if (files) {
        console.log('File details:', Array.from(files).map(f => ({
          name: f.name,
          type: f.type,
          size: f.size
        })));
      }
      console.log('Model:', model);
      
      sendMessage(
        {
          text: input,
          files: files || undefined,
        },
        {
          body: {
            model: model,
          },
        }
      );
      setInput('');
      setFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    if (!files) return;
    const dt = new DataTransfer();
    Array.from(files).forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });
    setFiles(dt.files.length > 0 ? dt.files : null);
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(
      { text: suggestion },
      {
        body: {
          model: model,
        },
      }
    );
  };

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col p-6">
      <div className="flex h-full min-h-0 flex-col">
        <Conversation className="relative min-h-0 w-full flex-1 overflow-hidden">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="No messages yet"
                description="Start a conversation to see messages here"
              />
            ) : (
              messages.map(message => (
                <div key={message.id}>
                  {message.role === 'assistant' &&
                    message.parts.filter(part => part.type === 'source-url')
                      .length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter(
                              part => part.type === 'source-url'
                            ).length
                          }
                        />
                        {message.parts
                          .filter(part => part.type === 'source-url')
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source
                                key={`${message.id}-${i}`}
                                href={part.url}
                                title={part.url}
                              />
                            </SourcesContent>
                          ))}
                      </Sources>
                    )}
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                <Response key={`${message.id}-${i}`}>
                                  {part.text}
                                </Response>
                              </MessageContent>
                            </Message>
                            {message.role === 'assistant' &&
                              i === messages.length - 1 && (
                                <Actions className="mt-2">
                                  <Action
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  >
                                    <CopyIcon className="size-3" />
                                  </Action>
                                </Actions>
                              )}
                          </Fragment>
                        );
                      case 'file':
                        if (part.url && part.mediaType?.startsWith('image/')) {
                          return (
                            <Message key={`${message.id}-${i}`} from={message.role}>
                              <MessageContent>
                                <img
                                  src={part.url}
                                  alt={part.filename || 'Uploaded image'}
                                  className="max-w-full rounded-lg"
                                />
                              </MessageContent>
                            </Message>
                          );
                        }
                        // Show filename for PDFs and Word docs
                        if (part.mediaType === 'application/pdf' ||
                            part.mediaType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                            part.mediaType === 'application/msword') {
                          return (
                            <Message key={`${message.id}-${i}`} from={message.role}>
                              <MessageContent>
                                <div className="flex items-center gap-2">
                                  <Paperclip className="size-4" />
                                  <span>{part.filename || 'Document'}</span>
                                </div>
                              </MessageContent>
                            </Message>
                          );
                        }
                        return null;
                      case 'reasoning':
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              status === 'streaming' &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ))
            )}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <Suggestions>
          {suggestions.map(suggestion => (
            <Suggestion
              key={suggestion}
              onClick={handleSuggestionClick}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>

        <PromptInput onSubmit={handleSubmit} className="mt-4 flex-shrink-0">
          <PromptInputTextarea
            onChange={e => setInput(e.target.value)}
            value={input}
            placeholder={files && files.length > 0 ? "Add a message about your files..." : "What would you like to know?"}
          />
          {files && files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pb-2">
              {Array.from(files).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-1.5 text-sm"
                >
                  <span className="max-w-[200px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <PromptInputToolbar>
            <PromptInputTools>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/*,text/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <PromptInputButton asChild>
                  <span className="cursor-pointer">
                    <Paperclip className="size-4" />
                  </span>
                </PromptInputButton>
              </label>
              <PromptInputModelSelect
                onValueChange={value => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map(model => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input.trim()} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;
