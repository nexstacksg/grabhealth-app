import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openaiModel } from '@/lib/openai';

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate AI response
    const { text } = await generateText({
      model: openaiModel,
      prompt: message,
      temperature: 0.7,
      maxRetries: 2,
    });

    // Prepare response
    const response: ChatResponse = {
      message: text,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        message: 'I apologize, but I encountered an error. Please try again.'
      },
      { status: 500 }
    );
  }
}