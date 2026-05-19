import { NextResponse } from 'next/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const to = formData.get('To') as string;
    const callerId = process.env.TWILIO_CALLER_ID;

    const twiml = new VoiceResponse();

    if (!callerId) {
      twiml.say(
        { language: 'fr-FR' },
        "Erreur de configuration. Aucun identifiant d'appelant défini."
      );
    } else if (to) {
      // Définir l'appel sortant vers le numéro du prospect
      const dial = twiml.dial({ callerId });
      dial.number(to);
    } else {
      twiml.say({ language: 'fr-FR' }, "Numéro de destination manquant.");
    }

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error: any) {
    console.error('Erreur Twilio Voice Webhook:', error);
    
    const twiml = new VoiceResponse();
    twiml.say({ language: 'fr-FR' }, "Une erreur est survenue lors de la connexion.");
    
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
