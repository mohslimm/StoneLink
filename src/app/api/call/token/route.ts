import { NextResponse } from 'next/server';
import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

export async function POST(request: Request) {
  try {
    const { identity } = await request.json();

    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioApiKey = process.env.TWILIO_API_KEY;
    const twilioApiSecret = process.env.TWILIO_API_SECRET;
    const twilioTwiMLAppSid = process.env.TWILIO_TWIML_APP_SID;

    if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret || !twilioTwiMLAppSid) {
      return NextResponse.json(
        { error: 'Configuration Twilio manquante dans le serveur.' },
        { status: 500 }
      );
    }

    // Création du token
    const accessToken = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      { identity: identity || 'stonelink-agent' }
    );

    // Accord des permissions vocales
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: twilioTwiMLAppSid,
      incomingAllow: false, // On n'accepte pas les appels entrants pour le moment
    });
    
    accessToken.addGrant(voiceGrant);

    return NextResponse.json({
      success: true,
      token: accessToken.toJwt(),
      identity: accessToken.identity,
    });
  } catch (error: any) {
    console.error('Erreur Twilio Token:', error);
    return NextResponse.json(
      { error: 'Impossible de générer le jeton VoIP.' },
      { status: 500 }
    );
  }
}
