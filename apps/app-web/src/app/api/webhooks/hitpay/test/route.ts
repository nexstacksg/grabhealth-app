import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('=== TEST WEBHOOK RECEIVED ===');
    console.log('Headers:', headers);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('Signature:', headers['x-hitpay-signature']);
    console.log('===========================');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test webhook received',
      payload,
      signature: headers['x-hitpay-signature']
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'HitPay test webhook endpoint is working' 
  });
}