import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { groq } from '@/lib/groq';
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') || formData.get('resume');
    
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text;

    const systemPrompt = `Extract a structured profile from this resume. Return only valid JSON with keys:
  skills (string[]), domains (string[]), experience_months (number), 
  preferred_roles (string[]), languages (string[]), tools (string[])`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: extractedText },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    
    if (!responseContent) {
      return NextResponse.json({ error: 'Failed to extract profile' }, { status: 500 });
    }

    const profileData = JSON.parse(responseContent);

    return NextResponse.json(profileData, { status: 200 });

  } catch (error: any) {
    console.error('Resume processing error:', error);
    return NextResponse.json({ error: error.message || 'Error processing resume' }, { status: 500 });
  }
}
